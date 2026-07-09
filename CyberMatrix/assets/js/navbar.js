// assets/js/navbar.js
// Loads navbar and footer components into pages

(function () {
  "use strict";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cybermatrix-theme", theme);

    const toggle = document.getElementById("themeToggle");
    const icon = document.getElementById("themeToggleIcon");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
    if (icon) {
      icon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
    }
  }

  function initializeTheme() {
    const savedTheme = localStorage.getItem("cybermatrix-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const theme = savedTheme || (prefersDark ? "dark" : "light");
    applyTheme(theme);
  }

  // Load HTML component into target element
  async function loadComponent(url, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load ${url}`);
      const html = await response.text();
      target.innerHTML = html;

      initializeComponent(targetId);
    } catch (error) {
      console.warn(`Component load failed for ${url}:`, error);
      if (targetId === "navbar-container") {
        target.innerHTML = `
                    <nav style="padding: 1rem; background: rgba(6,15,6,0.95); border-bottom: 1px solid #1f7a33; text-align: center;">
                        <a href="index.html" style="color: #aaffaa; text-decoration: none; font-size: 1.2rem;">
                            <i class="fas fa-shield-halved"></i> CyberMatrix
                        </a>
                    </nav>`;
      }
    }
  }

  function initializeComponent(targetId) {
    if (targetId === "navbar-container") {
      initializeTheme();

      const toggle = document.getElementById("navToggle");
      const links = document.getElementById("navLinks");
      if (toggle && links) {
        toggle.addEventListener("click", () => links.classList.toggle("open"));
      }

      const themeToggle = document.getElementById("themeToggle");
      if (themeToggle) {
        themeToggle.addEventListener("click", () => {
          const currentTheme =
            document.documentElement.getAttribute("data-theme") === "light"
              ? "light"
              : "dark";
          const nextTheme = currentTheme === "dark" ? "light" : "dark";
          applyTheme(nextTheme);
        });
      }

      const currentPage =
        window.location.pathname.split("/").pop() || "index.html";
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === currentPage) {
          link.classList.add("active");
        }
      });

      initializeSearch();
      initializeAuthAction();
    }
  }

  function initializeAuthAction() {
    const authLink = document.querySelector('.nav-cta[href="login.html"]');
    if (!authLink) return;

    const isLoggedIn = localStorage.getItem("cybermatrix-logged-in") === "true";
    if (!isLoggedIn) return;

    authLink.href = "#";
    authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    authLink.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("cybermatrix-logged-in");
      localStorage.removeItem("cybermatrix-user");
      window.location.href = "login.html";
    });
  }

  function initializeSearch() {
    const searchButton = document.getElementById("navSearchButton");
    const searchPanel = document.getElementById("searchPanel");
    const searchInput = document.getElementById("siteSearchInput");
    const searchResults = document.getElementById("searchResults");
    const closeButton = document.getElementById("searchCloseButton");

    if (!searchButton || !searchPanel || !searchInput || !searchResults) {
      return;
    }

    const searchableItems = [
      {
        title: "Threat Intelligence",
        url: "threats.html",
        description: "Monitor active threats and security signals",
      },
      {
        title: "Security Tools",
        url: "tools.html",
        description: "Utilities for hashing, encoding, and analysis",
      },
      {
        title: "Latest Articles",
        url: "articles.html",
        description: "Insights, guides, and best practices",
      },
      {
        title: "Cybersecurity News",
        url: "news.html",
        description: "Up-to-date alerts and reports",
      },
      {
        title: "Helpline",
        url: "helpline.html",
        description: "Get assistance from the AI security assistant",
      },
      {
        title: "Contact",
        url: "contact.html",
        description: "Reach the CyberMatrix team",
      },
    ];

    function renderResults(query) {
      const cleaned = query.trim().toLowerCase();
      if (!cleaned) {
        searchResults.innerHTML =
          '<div class="search-result"><strong>Try a term like</strong><small>threats, tools, news, helpline</small></div>';
        return;
      }

      const matches = searchableItems.filter((item) =>
        [item.title, item.description, item.url]
          .join(" ")
          .toLowerCase()
          .includes(cleaned),
      );

      if (!matches.length) {
        searchResults.innerHTML =
          '<div class="search-result"><strong>No results found</strong><small>Try another keyword</small></div>';
        return;
      }

      searchResults.innerHTML = matches
        .map(
          (item) => `
            <a class="search-result" href="${item.url}">
              <strong>${item.title}</strong>
              <small>${item.description}</small>
            </a>
          `,
        )
        .join("");
    }

    function openSearch() {
      searchPanel.classList.add("open");
      searchPanel.setAttribute("aria-hidden", "false");
      setTimeout(() => searchInput.focus(), 80);
      renderResults(searchInput.value);
    }

    function closeSearch() {
      searchPanel.classList.remove("open");
      searchPanel.setAttribute("aria-hidden", "true");
      searchInput.value = "";
      searchResults.innerHTML = "";
    }

    searchButton.addEventListener("click", openSearch);
    closeButton?.addEventListener("click", closeSearch);
    searchPanel.addEventListener("click", (event) => {
      if (event.target === searchPanel) closeSearch();
    });
    searchInput.addEventListener("input", (event) =>
      renderResults(event.target.value),
    );
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSearch();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadComponent("components/navbar.html", "navbar-container");
    loadComponent("components/footer.html", "footer-container");
  });
})();
