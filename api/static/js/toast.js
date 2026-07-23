/*
 * toast.js — single shared toast/notification implementation used across
 * every page (categories, datasets, quick-access, admin). Pages that fetch
 * data call window.showToast(message, type) directly; nothing page-specific
 * lives in here so the popup never drifts in look/behavior between pages.
 */
(function () {
  function ensureContainer() {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * @param {string} message
   * @param {"error"|"success"} [type="error"]
   * @param {number} [duration=6000] ms before auto-dismiss, 0 to disable
   * @param {{action?: {label: string, href?: string, onClick?: (event: MouseEvent) => void}}} [options]
   *   optional clickable action rendered under the message, e.g.
   *   { action: { label: "View Downloads", href: "/downloads" } }
   */
  window.showToast = function (message, type, duration, options) {
    type = type === "success" ? "success" : "error";
    duration = typeof duration === "number" ? duration : 6000;
    options = options || {};

    const container = ensureContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = /* html */ `
      <i class="fa ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} toast-icon"></i>
      <div class="toast-body">
        <span class="toast-message"></span>
      </div>
      <span class="toast-close">&times;</span>
    `;
    toast.querySelector(".toast-message").textContent = message;

    if (options.action && options.action.label) {
      const actionEl = document.createElement(options.action.href ? "a" : "button");
      actionEl.className = "toast-action";
      actionEl.textContent = options.action.label;
      if (options.action.href) {
        actionEl.href = options.action.href;
      }
      if (options.action.onClick) {
        actionEl.addEventListener("click", options.action.onClick);
      }
      toast.querySelector(".toast-body").appendChild(actionEl);
    }

    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    let dismissTimer = null;
    function remove() {
      if (dismissTimer) clearTimeout(dismissTimer);
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 200);
    }
    toast.querySelector(".toast-close").addEventListener("click", remove);
    if (duration > 0) {
      dismissTimer = setTimeout(remove, duration);
    }
    return toast;
  };
})();
