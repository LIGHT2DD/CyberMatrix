// assets/js/roadmap.js

(function () {
  "use strict";

  const roadmapData = {
    beginner: [
      "Learn basic networking: IP, DNS, HTTP, HTTPS",
      "Use strong unique passwords with a password manager",
      "Enable MFA and understand recovery codes",
      "Recognize phishing, fake links, and suspicious attachments",
      "Keep devices and apps updated",
      "Understand malware, ransomware, and social engineering",
      "Practice safe browsing and public Wi-Fi habits",
      "Learn basic data privacy and file sharing rules",
    ],
    intermediate: [
      "Read authentication, endpoint, firewall, and web logs",
      "Build a simple incident response checklist",
      "Harden accounts with least privilege and access reviews",
      "Learn vulnerability scanning and patch prioritization",
      "Practice backup, restore, and ransomware recovery planning",
      "Study common web risks like XSS, SQL injection, and auth flaws",
      "Use basic Linux, PowerShell, and command-line investigation tools",
      "Write clear security reports with evidence and next steps",
    ],
    advanced: [
      "Map threats with MITRE ATT&CK techniques",
      "Create detection logic for suspicious login and process behavior",
      "Investigate alerts using timelines and root-cause analysis",
      "Design segmented networks and Zero Trust access patterns",
      "Automate repetitive triage with scripts or SOAR-style workflows",
      "Perform cloud security reviews for IAM, storage, and logging",
      "Run tabletop exercises and improve response playbooks",
      "Track metrics, lessons learned, and risk reduction over time",
    ],
  };

  function initializeRoadmap() {
    document.querySelectorAll(".roadmap-card[data-roadmap]").forEach((card) => {
      const roadmapId = card.dataset.roadmap;
      const steps = roadmapData[roadmapId] || [];
      const stepsContainer = card.querySelector(".roadmap-steps");
      const progress = card.querySelector(".roadmap-progress .badge");
      const storageKey = `cybermatrix-roadmap-${roadmapId}`;
      const completed = new Set(
        JSON.parse(localStorage.getItem(storageKey) || "[]"),
      );

      if (!stepsContainer || !progress) return;

      function updateProgress() {
        progress.textContent = `${completed.size}/${steps.length} complete`;
        localStorage.setItem(
          "cm_roadmap_progress",
          JSON.stringify({
            level: roadmapId,
            complete: completed.size,
            total: steps.length,
          }),
        );
      }

      stepsContainer.innerHTML = steps
        .map(
          (step, index) => `
            <button class="roadmap-step" type="button" data-step="${index}">
              <i class="fas fa-circle"></i>
              <span>${step}</span>
            </button>
          `,
        )
        .join("");

      stepsContainer.querySelectorAll(".roadmap-step").forEach((button) => {
        const stepId = button.dataset.step;
        if (completed.has(stepId)) {
          button.classList.add("completed");
          button.querySelector("i").className = "fas fa-check-circle";
        }

        button.addEventListener("click", () => {
          if (completed.has(stepId)) {
            completed.delete(stepId);
            button.classList.remove("completed");
            button.querySelector("i").className = "fas fa-circle";
          } else {
            completed.add(stepId);
            button.classList.add("completed");
            button.querySelector("i").className = "fas fa-check-circle";
          }

          localStorage.setItem(storageKey, JSON.stringify([...completed]));
          updateProgress();
        });
      });

      updateProgress();
    });
  }

  document.addEventListener("DOMContentLoaded", initializeRoadmap);
})();
