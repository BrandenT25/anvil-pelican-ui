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
    .map(
      (file) => `
        <li class="downloads-entry-file downloads-entry-file-${file.status}" title="${escapeHtml(file.path)}">
          <i class="fa ${file.status === "succeeded" ? "fa-check" : "fa-times"}"></i>
          <span>${escapeHtml(baseName(file.path))}</span>
        </li>`,
    )
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
    ${renderFileList(entry.files)}
    ${showOodLink ? `<a class="downloads-entry-ood-link" href="${buildOodUrl(entry.destination)}" target="_blank" rel="noopener noreferrer"><i class="fa fa-external-link"></i> Open in File Browser</a>` : ""}
  `;
  return card;
}

async function loadDownloadHistory() {
  const list = document.querySelector(".downloads-list");
  const emptyState = document.querySelector(".downloads-empty-state");
  const emptyStateText = emptyState.querySelector(".downloads-empty-state-text");
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
      list.appendChild(renderEntry(entry));
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
