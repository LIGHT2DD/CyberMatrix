// assets/js/home.js
// Homepage-specific functionality

(function () {
  "use strict";

  // Counter animation
  function animateCounters() {
    const counters = document.querySelectorAll(".stat-number[data-count]");

    counters.forEach((counter) => {
      const target = parseFloat(counter.getAttribute("data-count"));
      const duration = 2000; // ms
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;

        if (step >= steps) {
          counter.textContent =
            target % 1 === 0 ? target.toLocaleString() : target.toFixed(1);
          clearInterval(timer);
        } else {
          counter.textContent =
            target % 1 === 0
              ? Math.floor(current).toLocaleString()
              : current.toFixed(1);
        }
      }, duration / steps);
    });
  }

  async function getJsonCount(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    const data = await response.json();
    return Array.isArray(data) ? data.length : Object.keys(data || {}).length;
  }

  async function getToolCount() {
    const response = await fetch("tools.html");
    if (!response.ok) throw new Error("Unable to load tools.html");
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.querySelectorAll(".tool-tab[data-tool]").length;
  }

  function setStatValue(name, value) {
    const stat = document.querySelector(`.stat-number[data-stat="${name}"]`);
    if (stat) {
      stat.dataset.count = String(value);
      stat.textContent = "0";
    }
  }

  function setText(id, value) {
    const target = document.getElementById(id);
    if (target) target.textContent = Number(value).toLocaleString();
  }

  async function updateLiveStats() {
    const fallback = {
      threats: 0,
      articles: 0,
      tools: 0,
    };

    const results = await Promise.allSettled([
      getJsonCount("data/threats.json"),
      getJsonCount("data/articles.json"),
      getToolCount(),
    ]);
    const [threats, articles, tools] = results.map((result, index) => {
      if (result.status === "fulfilled") return result.value;
      console.warn("Failed to update stat:", result.reason);
      return Object.values(fallback)[index];
    });

    setStatValue("threats", threats);
    setStatValue("articles", articles);
    setStatValue("tools", tools);
    setText("terminalThreatCount", threats);
    setText("terminalArticleCount", articles);
    setText("terminalToolCount", tools);

    animateCounters();
  }

  function getSeverityMeta(severity) {
    const normalized = (severity || "").toString().trim().toLowerCase();
    const map = {
      low: { label: "Low", color: "rgba(74, 181, 67, 0.25)" },
      guarded: { label: "Guarded", color: "rgba(255, 215, 0, 0.25)" },
      elevated: { label: "Elevated", color: "rgba(255, 140, 0, 0.25)" },
      high: { label: "High", color: "rgba(255, 80, 80, 0.25)" },
      critical: { label: "Critical", color: "rgba(25, 25, 25, 0.8)" },
    };

    return (
      map[normalized] || {
        label: severity || "Guarded",
        color: "rgba(255, 215, 0, 0.25)",
      }
    );
  }

  // Load latest threats
  async function loadLatestThreats() {
    const container = document.getElementById("latestThreats");
    if (!container) return;

    try {
      const response = await fetch("data/threats.json");
      const threats = await response.json();

      // Show first 4 threats
      const latest = threats.slice(0, 4);

      container.innerHTML = latest
        .map((threat) => {
          const severity = getSeverityMeta(threat.severity);
          return `
                <div class="card">
                    <div class="card-icon">
                        <i class="fas ${threat.icon || "fa-skull"}"></i>
                    </div>
                    <h3 class="card-title">${threat.name}</h3>
                    <p class="card-text">${threat.description}</p>
                    <div style="margin-top: 0.8rem;">
                        <span class="badge" style="background: ${severity.color};">
                            <i class="fas fa-exclamation-triangle"></i> ${severity.label}
                        </span>
                    </div>
                </div>
            `;
        })
        .join("");
    } catch (error) {
      console.warn("Failed to load threats:", error);
      container.innerHTML = `
                <div class="card">
                    <div class="card-icon"><i class="fas fa-skull"></i></div>
                    <h3 class="card-title">Threat Data Unavailable</h3>
                    <p class="card-text">Unable to load threat data. Please try again later or visit the threats page.</p>
                    <a href="threats.html" class="btn-matrix btn-matrix-outline" style="margin-top: 0.8rem; display: inline-flex;">View Threats</a>
                </div>`;
    }
  }

  function showDailySecurityTip() {
    const target = document.getElementById("dailySecurityTip");
    if (!target) return;

    const tips = [
      "Use a password manager so every account can have a unique password.",
      "Turn on MFA for email first. Most account resets start there.",
      "Hover or long-press links before opening unexpected messages.",
      "Keep browsers and phones updated; many attacks rely on old versions.",
      "Back up files you cannot replace before you need the backup.",
      "Do not share one-time codes, even with someone claiming to be support.",
      "Review active sessions after any suspicious login alert.",
    ];
    const day = Math.floor(Date.now() / 86400000);
    target.textContent = tips[day % tips.length];
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    updateLiveStats();
    loadLatestThreats();
    showDailySecurityTip();
  });
})();
