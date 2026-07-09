// assets/js/threats.js
// Threat Intelligence page functionality

(function () {
  "use strict";

  const THREATS_API_URL =
    "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
  const LOCAL_THREATS_URL = "data/threats.json";

  let allThreats = [];
  let currentFilter = "all";

  // Fetch threat data
  async function loadThreats() {
    const grid = document.getElementById("threatsGrid");
    if (!grid) return;

    try {
      allThreats = await fetchThreatsFromApi();
      renderThreats(allThreats);
    } catch (error) {
      console.warn("Failed to load threats:", error);
      try {
        allThreats = await fetchLocalThreats();
        renderThreats(allThreats);
      } catch (fallbackError) {
        console.warn("Failed to load fallback threats:", fallbackError);
        grid.innerHTML = `
                  <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                      <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff7777; margin-bottom: 1rem; display: block;"></i>
                      <h3>Unable to Load Threat Data</h3>
                      <p style="color: #88dd99;">Please check your connection and try again.</p>
                      <button class="btn-matrix" onclick="location.reload()" style="margin-top: 1rem;">
                          <i class="fas fa-sync-alt"></i> Retry
                      </button>
                  </div>`;
      }
    }
  }

  async function fetchThreatsFromApi() {
    const response = await fetch(THREATS_API_URL);
    if (!response.ok) throw new Error("Failed to fetch API threats");

    const data = await response.json();
    return (data.vulnerabilities || []).slice(0, 24).map(mapApiThreat);
  }

  async function fetchLocalThreats() {
    const response = await fetch(LOCAL_THREATS_URL);
    if (!response.ok) throw new Error("Failed to fetch local threats");

    return response.json();
  }

  function mapApiThreat(item, index) {
    const category = getThreatCategory(item);
    const cveId = item.cveID || `THREAT-${index + 1}`;
    const dueDate = item.dueDate || "Review immediately";

    return {
      id: cveId,
      name: item.vulnerabilityName || cveId,
      description:
        item.shortDescription ||
        "Known exploited vulnerability requiring investigation and mitigation.",
      severity: getApiSeverity(dueDate),
      category,
      icon: getThreatIcon(category),
      indicators: [
        `CVE: ${cveId}`,
        `Vendor: ${item.vendorProject || "Unknown"}`,
        `Product: ${item.product || "Unknown"}`,
        `Action due: ${dueDate}`,
      ],
      mitigation:
        item.requiredAction ||
        "Apply vendor guidance, patch affected assets, and monitor for exploitation.",
      sourceUrl: item.notes || "",
    };
  }

  function getThreatCategory(item) {
    const text = [
      item.vulnerabilityName,
      item.shortDescription,
      item.vendorProject,
      item.product,
      item.requiredAction,
    ]
      .join(" ")
      .toLowerCase();

    if (text.includes("ransom")) return "ransomware";
    if (text.includes("phish") || text.includes("credential")) return "phishing";
    if (text.includes("denial") || text.includes("ddos")) return "ddos";
    if (text.includes("social") || text.includes("spoof")) return "social-engineering";
    if (text.includes("insider") || text.includes("privilege")) return "insider-threat";

    return "zero-day";
  }

  function getThreatIcon(category) {
    const icons = {
      malware: "fa-virus",
      phishing: "fa-fish",
      ransomware: "fa-skull",
      ddos: "fa-network-wired",
      "zero-day": "fa-biohazard",
      "social-engineering": "fa-users",
      "insider-threat": "fa-user-secret",
    };

    return icons[category] || "fa-skull";
  }

  function getApiSeverity(dueDate) {
    if (!dueDate) return "High";

    const dueTime = new Date(dueDate).getTime();
    if (Number.isNaN(dueTime)) return "High";

    const daysUntilDue = Math.ceil((dueTime - Date.now()) / 86400000);
    if (daysUntilDue <= 0) return "Critical";
    if (daysUntilDue <= 14) return "High";
    if (daysUntilDue <= 30) return "Elevated";

    return "Guarded";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function renderIndicators(indicators, limit = indicators.length) {
    return (indicators || [])
      .slice(0, limit)
      .map((indicator) => {
        const [label, ...valueParts] = String(indicator).split(":");
        const value = valueParts.join(":").trim();

        if (!value) {
          return `<span class="indicator-chip">${escapeHtml(indicator)}</span>`;
        }

        return `
          <span class="indicator-chip">
            <strong>${escapeHtml(label.trim())}</strong>
            ${escapeHtml(value)}
          </span>`;
      })
      .join("");
  }

  function getSeverityMeta(severity) {
    const normalized = (severity || "").toString().trim().toLowerCase();
    const map = {
      low: { label: "Low", className: "low" },
      guarded: { label: "Guarded", className: "guarded" },
      elevated: { label: "Elevated", className: "elevated" },
      high: { label: "High", className: "high" },
      critical: { label: "Critical", className: "critical" },
    };

    return (
      map[normalized] || { label: severity || "Guarded", className: "guarded" }
    );
  }

  function renderThreats(threats) {
    const grid = document.getElementById("threatsGrid");
    const noResults = document.getElementById("noResults");

    if (!grid) return;

    if (threats.length === 0) {
      grid.innerHTML = "";
      noResults.style.display = "block";
      return;
    }

    noResults.style.display = "none";

    grid.innerHTML = threats
      .map((threat) => {
        const severity = getSeverityMeta(threat.severity);
        return `
            <div class="threat-card severity-${severity.className}" 
                 data-id="${escapeHtml(threat.id)}">
                <div class="threat-card-header">
                    <div class="threat-card-icon">
                        <i class="fas ${escapeHtml(threat.icon || "fa-skull")}"></i>
                    </div>
                    <div class="threat-card-info">
                        <span class="category-label">${escapeHtml(threat.category.replace("-", " "))}</span>
                        <h3>${escapeHtml(threat.name)}</h3>
                    </div>
                </div>
                <div class="threat-card-body">
                    ${escapeHtml(threat.description)}
                </div>
                <div class="threat-indicators-preview">
                    ${renderIndicators(threat.indicators, 2)}
                </div>
                <div class="threat-card-footer">
                    <span class="severity-badge ${severity.className}">
                        <i class="fas fa-exclamation-triangle"></i> ${severity.label}
                    </span>
                    <span style="font-size: 0.65rem; color: #66aa77;">
                        Click for details <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
            </div>
        `;
      })
      .join("");
  }

  // Filter threats
  function filterThreats(category) {
    currentFilter = category;

    // Update active button
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.filter === category) {
        btn.classList.add("active");
      }
    });

    if (category === "all") {
      renderThreats(allThreats);
    } else {
      const filtered = allThreats.filter((t) => t.category === category);
      renderThreats(filtered);
    }
  }

  // Modal functionality
  window._openThreatModal = function (threatId) {
    const threat = allThreats.find((t) => String(t.id) === String(threatId));
    if (!threat) return;

    const modal = document.getElementById("threatModal");
    const modalBody = document.getElementById("modalBody");

    const severity = getSeverityMeta(threat.severity);

    modalBody.innerHTML = `
            <div class="modal-detail">
                <div class="modal-detail-icon">
                    <i class="fas ${escapeHtml(threat.icon || "fa-skull")}"></i>
                </div>
                <span class="severity-badge ${severity.className}" style="margin-bottom: 1rem; display: inline-block;">
                    <i class="fas fa-exclamation-triangle"></i> ${severity.label}
                </span>
                <h3>${escapeHtml(threat.name)}</h3>
                <p style="color: #88dd99; margin-bottom: 1.5rem; line-height: 1.8;">${escapeHtml(threat.description)}</p>
                
                <h4 style="font-size: 0.85rem; color: #66dd88; margin-bottom: 0.8rem;">
                    <i class="fas fa-search"></i> Indicators of Compromise
                </h4>
                <div class="indicators-list" style="margin-bottom: 1.5rem;">
                    ${renderIndicators(threat.indicators)}
                </div>
                
                <h4 style="font-size: 0.85rem; color: #66dd88; margin-bottom: 0.8rem;">
                    <i class="fas fa-shield"></i> Mitigation
                </h4>
                <p class="mitigation-text">${escapeHtml(threat.mitigation)}</p>
            </div>
        `;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  function closeModal() {
    const modal = document.getElementById("threatModal");
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    loadThreats();

    // Filter button clicks
    document.getElementById("threatFilters")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterThreats(btn.dataset.filter);
    });

    document.getElementById("threatsGrid")?.addEventListener("click", (e) => {
      const card = e.target.closest(".threat-card");
      if (!card?.dataset.id) return;
      window._openThreatModal(card.dataset.id);
    });

    // Modal close
    document
      .getElementById("closeModal")
      ?.addEventListener("click", closeModal);
    document.getElementById("threatModal")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    // ESC key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  });
})();
