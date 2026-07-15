/*
 * docs.js — behavior for the Documentation page only.
 * 1. Builds the right-side "On this page" list from the content's h2/h3 headings.
 * 2. Scroll-spy: highlights the current heading in both the TOC and the sidebar.
 * 3. Sidebar group collapse/expand.
 * No fetches, no shared state — everything is local to this page.
 */

function buildToc() {
  const tocList = document.querySelector(".docs-toc-list");
  const headings = document.querySelectorAll(".docs-content h2[id], .docs-content h3[id]");
  headings.forEach((heading) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.className = "docs-toc-link" + (heading.tagName === "H3" ? " docs-toc-sub" : "");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    item.appendChild(link);
    tocList.appendChild(item);
  });
}

function initScrollSpy() {
  const headings = Array.from(
    document.querySelectorAll(".docs-content h2[id], .docs-content h3[id]"),
  );
  const tocLinks = document.querySelectorAll(".docs-toc-link");
  const sidebarLinks = document.querySelectorAll(".docs-sidebar-link");

  function setActive(id) {
    tocLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
    sidebarLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;
      if (atBottom && headings.length) {
        setActive(headings[headings.length - 1].id);
        return;
      }
      const offset = window.scrollY + 160;
      let current = headings[0];
      headings.forEach((heading) => {
        if (heading.offsetTop <= offset) {
          current = heading;
        }
      });
      if (current) {
        setActive(current.id);
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initSidebarGroups() {
  document.querySelectorAll(".docs-sidebar-chevron").forEach((chevron) => {
    chevron.addEventListener("click", (event) => {
      event.preventDefault();
      chevron.closest(".docs-sidebar-group").classList.toggle("collapsed");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildToc();
  initScrollSpy();
  initSidebarGroups();
});
