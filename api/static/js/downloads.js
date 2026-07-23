/*
 * downloads.js — the /downloads history page. Fetches the local
 * downloads-history DB once on load (or on manual Refresh click, per the
 * "no live polling needed" scope) and renders it newest-first.
 */

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

function formatTimestamp(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function statusLabel(status) {
  switch (status) {
    case "complete": return "Complete";
    case "partial": return "Partially failed";
    case "failed": return "Failed";
    case "in_progress": return "In progress";
    default: return status;
  }
}

// same OOD file-browser URL pattern used by datasets.js/quick-access.js's
// own download-result rendering — this page reconstructs it client-side
// from the stored destination rather than persisting a precomputed URL
function buildOodUrl(destination) {
  return `${window.location.origin}/pun/sys/dashboard/files/fs${destination.split("/").map(encodeURIComponent).join("/")}`;
}

// path -> just the last segment, for a compact per-file label; the full
// path is still available via the title attribute on hover
function baseName(path) {
  return path.split("/").filter(Boolean).pop() || path;
}

function renderFileList(files) {
  if (!files || files.length === 0) return "";
  const rows = files
    .map((file) => {
      const icon = file.status === "succeeded" ? "fa-check" : file.status === "failed" ? "fa-times" : "fa-circle-o";
      return `
        <li class="downloads-entry-file downloads-entry-file-${file.status}" title="${escapeHtml(file.path)}">
          <i class="fa ${icon}"></i>
          <span>${escapeHtml(baseName(file.path))}</span>
        </li>`;
    })
    .join("");
  return /* html */ `
    <details class="downloads-entry-files">
      <summary class="downloads-entry-files-summary">Show files (${files.length})</summary>
      <ul class="downloads-entry-files-list">${rows}</ul>
    </details>
  `;
}

function renderEntry(entry) {
  const card = document.createElement("div");
  card.className = "downloads-entry";

  const itemsLabel = `${entry.item_count} item${entry.item_count === 1 ? "" : "s"}`;
  const showOodLink = entry.status === "complete" || entry.status === "partial";

  card.innerHTML = /* html */ `
    <div class="downloads-entry-top">
      <span class="downloads-entry-name">${escapeHtml(entry.name)}</span>
      <span class="downloads-entry-status downloads-entry-status-${entry.status}">${statusLabel(entry.status)}</span>
    </div>
    <div class="downloads-entry-destination">${escapeHtml(entry.destination)}</div>
    <div class="downloads-entry-meta">
      <span>${itemsLabel}</span>
      <span>Started ${formatTimestamp(entry.started_at)}</span>
      ${entry.finished_at ? `<span>Finished ${formatTimestamp(entry.finished_at)}</span>` : ""}
    </div>
    ${entry.error_message ? `<div class="downloads-entry-error"><i class="fa fa-exclamation-circle"></i> ${escapeHtml(entry.error_message)}</div>` : ""}
    <div class="downloads-entry-files-slot">${renderFileList(entry.files)}</div>
    ${showOodLink ? `<a class="downloads-entry-ood-link" href="${buildOodUrl(entry.destination)}" target="_blank" rel="noopener noreferrer"><i class="fa fa-external-link"></i> Open in File Browser</a>` : ""}
  `;
  return card;
}

const DOWNLOAD_JOB_POLL_INTERVAL_MS = 2000;
const DOWNLOAD_JOB_TERMINAL_STATUSES = ["complete", "partial", "failed"];

// setInterval handles for every card currently polling its in-progress job,
// so a Refresh click (which rebuilds the whole list) doesn't leak polls for
// cards that no longer exist in the DOM
let activePollHandles = [];

/**
 * Polls a single in-progress card's job status every 2s and swaps in the
 * live per-file list (done/not yet downloaded/failed), sourced from
 * download_jobs via the same status endpoint datasets.js/quick-access.js
 * already poll while starting a download. Stops once the job reaches a
 * terminal state. Only the file disclosure is updated in place — the rest
 * of the card (badge, timestamps, OOD link) still reflects what was true on
 * last page load/Refresh, by design.
 * @param {HTMLElement} card
 * @param {string} jobId
 */
function startCardPolling(card, jobId) {
  let handle;
  const poll = async () => {
    try {
      const response = await fetch(`${window.ROOT_PATH}/datasets/download/status/${jobId}`, { cache: "no-store" });
      if (!response.ok) return;
      const job = await response.json();
      const slot = card.querySelector(".downloads-entry-files-slot");
      if (slot) {
        // preserve whether the user had the disclosure open across the swap —
        // otherwise it'd yank itself shut every 2s while being watched
        const wasOpen = slot.querySelector("details")?.open ?? false;
        slot.innerHTML = renderFileList(job.files);
        const details = slot.querySelector("details");
        if (details && wasOpen) details.open = true;
      }
      if (DOWNLOAD_JOB_TERMINAL_STATUSES.includes(job.status)) {
        clearInterval(handle);
        activePollHandles = activePollHandles.filter((h) => h !== handle);
      }
    } catch (error) {
      console.log("polling job status failed for", jobId, error);
    }
  };
  poll();
  handle = setInterval(poll, DOWNLOAD_JOB_POLL_INTERVAL_MS);
  activePollHandles.push(handle);
}

async function loadDownloadHistory() {
  const list = document.querySelector(".downloads-list");
  const emptyState = document.querySelector(".downloads-empty-state");
  const emptyStateText = emptyState.querySelector(".downloads-empty-state-text");
  activePollHandles.forEach(clearInterval);
  activePollHandles = [];
  list.innerHTML = "";
  try {
    const response = await fetch(`${window.ROOT_PATH}/downloads/history`);
    if (!response.ok) {
      throw new Error(`HTTP error! status ${response.status}`);
    }
    const history = await response.json();
    if (history.length === 0) {
      emptyStateText.textContent = "No downloads yet. Files you download from Explore Datasets or Quick Access will show up here.";
      emptyState.style.display = "flex";
      return;
    }
    emptyState.style.display = "none";
    history.forEach((entry) => {
      const card = renderEntry(entry);
      list.appendChild(card);
      if (entry.status === "in_progress" && entry.job_id) {
        startCardPolling(card, entry.job_id);
      }
    });
  } catch (error) {
    console.log("loading download history failed", error);
    showToast("Couldn't load download history. Try again.", "error");
    emptyStateText.textContent = "Something went wrong loading download history.";
    emptyState.style.display = "flex";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDownloadHistory();
  document.querySelector(".downloads-refresh-button").addEventListener("click", loadDownloadHistory);
});
