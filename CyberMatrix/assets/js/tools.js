// assets/js/tools.js
// Security tools functionality - all client-side

(function () {
  "use strict";

  // ===== TOOL TAB SWITCHING =====
  function switchTool(toolName) {
    // Update tabs
    document.querySelectorAll(".tool-tab").forEach((tab) => {
      tab.classList.remove("active");
      if (tab.dataset.tool === toolName) tab.classList.add("active");
    });

    // Update panels
    document.querySelectorAll(".tool-panel").forEach((panel) => {
      panel.classList.remove("active");
    });
    const targetPanel = document.getElementById(`panel-${toolName}`);
    if (targetPanel) targetPanel.classList.add("active");
  }

  // ===== COPY TO CLIPBOARD =====
  function copyToClipboard(text, button) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.borderColor = "#27c93f";
        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.style.borderColor = "";
        }, 2000);
      })
      .catch(() => {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      });
  }

  // ===== PASSWORD GENERATOR =====
  function generatePassword() {
    const length = parseInt(document.getElementById("passLength").value);
    const includeUpper = document.getElementById("includeUpper").checked;
    const includeLower = document.getElementById("includeLower").checked;
    const includeNumbers = document.getElementById("includeNumbers").checked;
    const includeSymbols = document.getElementById("includeSymbols").checked;

    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let charPool = "";
    if (includeUpper) charPool += upperChars;
    if (includeLower) charPool += lowerChars;
    if (includeNumbers) charPool += numberChars;
    if (includeSymbols) charPool += symbolChars;

    if (!charPool) {
      document.getElementById("generatedPassword").value =
        "Select at least one character type.";
      return;
    }

    let password = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += charPool[array[i] % charPool.length];
    }

    document.getElementById("generatedPassword").value = password;
    checkPasswordStrength(password, "strengthFill", "strengthText");
    document.getElementById("passwordStrengthBar").style.display = "block";
  }

  // ===== PASSWORD STRENGTH CHECKER =====
  function checkPasswordStrength(password, fillId, textId) {
    const fill = document.getElementById(fillId);
    const text = document.getElementById(textId);
    if (!fill || !text) return;

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 20) score++;

    let strength, color, width;
    if (score <= 2) {
      strength = "Weak";
      color = "#ff4444";
      width = "25%";
    } else if (score <= 4) {
      strength = "Fair";
      color = "#ff8c00";
      width = "50%";
    } else if (score <= 6) {
      strength = "Strong";
      color = "#ffd700";
      width = "75%";
    } else {
      strength = "Very Strong";
      color = "#27c93f";
      width = "100%";
    }

    fill.style.width = width;
    fill.style.background = color;
    text.textContent = `Strength: ${strength} (Score: ${score}/8)`;
    text.style.color = color;
  }

  // ===== HASH GENERATOR =====
  async function generateHash() {
    const input = document.getElementById("hashInput").value;
    const algorithm = document.getElementById("hashAlgorithm").value;
    const output = document.getElementById("hashOutput");
    const warning = document.getElementById("hashWarning");

    if (!input) {
      output.value = "Please enter text to hash.";
      return;
    }

    // Show warning for legacy algorithms
    if (algorithm === "MD5" || algorithm === "SHA-1") {
      warning.style.display = "block";
    } else {
      warning.style.display = "none";
    }

    try {
      let hash;
      if (algorithm === "MD5") {
        // MD5 not in Web Crypto, use alternative or show message
        output.value =
          "MD5 requires a library (e.g., crypto-js). Using SHA-256 instead for demo.";
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        hash = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        output.value = `[Demo: SHA-256] ${hash}`;
      } else {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        hash = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        output.value = hash;
      }
    } catch (error) {
      output.value = `Error: ${error.message}`;
    }
  }

  // ===== BASE64 ENCODE/DECODE =====
  function encodeBase64() {
    const input = document.getElementById("b64EncodeInput").value;
    const output = document.getElementById("b64EncodeOutput");
    try {
      output.value = btoa(unescape(encodeURIComponent(input)));
    } catch {
      output.value = btoa(input);
    }
  }

  function decodeBase64() {
    const input = document.getElementById("b64DecodeInput").value;
    const output = document.getElementById("b64DecodeOutput");
    try {
      output.value = decodeURIComponent(escape(atob(input)));
    } catch {
      try {
        output.value = atob(input);
      } catch {
        output.value = "Invalid Base64 string.";
      }
    }
  }

  // ===== URL ENCODE/DECODE =====
  function encodeURL() {
    const input = document.getElementById("urlEncodeInput").value;
    document.getElementById("urlEncodeOutput").value =
      encodeURIComponent(input);
  }

  function decodeURL() {
    const input = document.getElementById("urlDecodeInput").value;
    try {
      document.getElementById("urlDecodeOutput").value =
        decodeURIComponent(input);
    } catch {
      document.getElementById("urlDecodeOutput").value =
        "Invalid URL-encoded string.";
    }
  }

  // ===== JSON FORMATTER =====
  function formatJSON() {
    const input = document.getElementById("jsonInput").value;
    const output = document.getElementById("jsonOutput");
    const status = document.getElementById("jsonStatus");

    try {
      const parsed = JSON.parse(input);
      output.value = JSON.stringify(parsed, null, 2);
      status.textContent = "✅ Valid JSON";
      status.style.color = "#27c93f";
    } catch (e) {
      status.textContent = `❌ Invalid JSON: ${e.message}`;
      status.style.color = "#ff4444";
    }
  }

  function minifyJSON() {
    const input = document.getElementById("jsonInput").value;
    const output = document.getElementById("jsonOutput");
    const status = document.getElementById("jsonStatus");

    try {
      const parsed = JSON.parse(input);
      output.value = JSON.stringify(parsed);
      status.textContent = "✅ Minified successfully";
      status.style.color = "#27c93f";
    } catch (e) {
      status.textContent = `❌ Invalid JSON: ${e.message}`;
      status.style.color = "#ff4444";
    }
  }

  function validateJSON() {
    const input = document.getElementById("jsonInput").value;
    const status = document.getElementById("jsonStatus");

    try {
      JSON.parse(input);
      status.textContent = "✅ Valid JSON syntax";
      status.style.color = "#27c93f";
    } catch (e) {
      status.textContent = `❌ Invalid: ${e.message}`;
      status.style.color = "#ff4444";
    }
  }

  // ===== TEXT CASE CONVERTER =====
  function convertTextCase() {
    const input = document.getElementById("textCaseInput").value;
    const mode = document.getElementById("textCaseMode").value;
    const output = document.getElementById("textCaseOutput");

    if (!input) {
      output.value = "";
      return;
    }

    let converted = input;
    if (mode === "upper") {
      converted = input.toUpperCase();
    } else if (mode === "lower") {
      converted = input.toLowerCase();
    } else if (mode === "title") {
      converted = input
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else if (mode === "sentence") {
      converted = input
        .toLowerCase()
        .replace(
          /(^\s*|[.!?]\s+)([a-z])/g,
          (match, p1, p2) => p1 + p2.toUpperCase(),
        );
    }

    output.value = converted;
  }

  // ===== UUID GENERATOR =====
  function generateUUID() {
    const output = document.getElementById("uuidOutput");
    output.value = crypto.randomUUID
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
  }

  // ===== HEX CONVERTER =====
  function encodeHex() {
    const input = document.getElementById("hexInput").value;
    const output = document.getElementById("hexOutput");
    output.value = Array.from(input)
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
  }

  function decodeHex() {
    const input = document.getElementById("hexInput").value;
    const output = document.getElementById("hexOutput");
    const cleaned = input.replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
      output.value = "Invalid hexadecimal input.";
      return;
    }

    const bytes = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes.push(String.fromCharCode(parseInt(cleaned.slice(i, i + 2), 16)));
    }
    output.value = bytes.join("");
  }

  // ===== SECURITY CHECKLIST GENERATOR =====
  function generateChecklist() {
    const environment =
      document.getElementById("checklistEnvironment")?.value || "web";
    const output = document.getElementById("checklistOutput");

    const checklistByEnv = {
      web: [
        "Enable HTTPS and HSTS",
        "Validate all input and sanitize output",
        "Use parameterized queries and secure session handling",
        "Review CSP, X-Frame-Options, and CORS headers",
      ],
      endpoint: [
        "Enforce MFA and least-privilege access",
        "Apply disk encryption and endpoint protection",
        "Patch OS and endpoint software regularly",
        "Monitor logs and suspicious process activity",
      ],
      cloud: [
        "Review IAM roles and service permissions",
        "Enable cloud logging and alerting",
        "Use encryption at rest and in transit",
        "Validate backup and recovery processes",
      ],
    };

    output.value = `Security Checklist (${environment})\n\n- ${checklistByEnv[environment].join("\n- ")}`;
  }

  // ===== JWT DECODER =====
  function decodeJWT() {
    const input = document.getElementById("jwtInput").value.trim();
    const output = document.getElementById("jwtOutput");

    try {
      const parts = input.split(".");
      if (parts.length < 2) {
        output.value = "Invalid JWT format.";
        return;
      }
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      output.value = JSON.stringify(payload, null, 2);
    } catch {
      output.value = "Unable to decode JWT. Check the token format.";
    }
  }

  // ===== DATA SANITIZER =====
  function sanitizeData() {
    const input = document.getElementById("sanitizeInput").value;
    const output = document.getElementById("sanitizeOutput");
    output.value = input.replace(/[<>"'&]/g, "");
  }

  // ===== REGEX SECURITY TESTER =====
  function testRegex() {
    const pattern = document.getElementById("regexPattern").value;
    const sample = document.getElementById("regexSample").value;
    const output = document.getElementById("regexOutput");

    try {
      const regex = new RegExp(pattern);
      output.value = regex.test(sample) ? "Match found" : "No match";
    } catch (error) {
      output.value = `Invalid regex: ${error.message}`;
    }
  }

  // ===== SSL CHECKER =====
  function checkSSLSetup() {
    const domain = document.getElementById("sslDomain").value.trim();
    const output = document.getElementById("sslOutput");
    if (!domain) {
      output.value = "Enter a domain name first.";
      return;
    }

    output.value = `SSL guidance for ${domain}\n\n- Use HTTPS with a valid certificate\n- Ensure the certificate covers the hostname\n- Prefer TLS 1.2+ and disable older protocols\n- Renew before expiration and monitor chain issues`;
  }

  // ===== SECURITY HEADERS CHECKER =====
  function checkHeaders() {
    const url = document.getElementById("headersUrl").value.trim();
    const output = document.getElementById("headersOutput");
    if (!url) {
      output.value = "Enter a URL first.";
      return;
    }

    output.value = `Header review for ${url}\n\nRecommended headers:\n- Content-Security-Policy\n- Strict-Transport-Security\n- X-Content-Type-Options\n- Referrer-Policy\n- Permissions-Policy`;
  }

  // ===== CORS ANALYZER =====
  function analyzeCORS() {
    const origin = document.getElementById("corsOrigin").value.trim();
    const output = document.getElementById("corsOutput");
    if (!origin) {
      output.value = "Enter an origin first.";
      return;
    }

    output.value = `CORS review for ${origin}\n\n- Allow only trusted origins\n- Avoid using * for credentialed requests\n- Restrict methods and headers to the minimum needed`;
  }

  // ===== FILE HASH CALCULATOR =====
  async function calculateFileHash() {
    const fileInput = document.getElementById("fileHashInput");
    const output = document.getElementById("fileHashOutput");
    const file = fileInput.files[0];

    if (!file) {
      output.value = "Choose a file first.";
      return;
    }

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    output.value = `SHA-256: ${hash}`;
  }

  // ===== FILE DIFF CHECKER =====
  function checkDiff() {
    const original = document.getElementById("diffOriginal").value;
    const updated = document.getElementById("diffUpdated").value;
    const output = document.getElementById("diffOutput");

    const lines1 = original.split(/\n/);
    const lines2 = updated.split(/\n/);
    const max = Math.max(lines1.length, lines2.length);
    const diffLines = [];

    for (let i = 0; i < max; i += 1) {
      if (lines1[i] !== lines2[i]) {
        diffLines.push(
          `Line ${i + 1}:\n- ${lines1[i] || "<empty>"}\n+ ${lines2[i] || "<empty>"}`,
        );
      }
    }

    output.value = diffLines.length
      ? diffLines.join("\n\n")
      : "No differences found.";
  }

  // ===== SUBDOMAIN ENUMERATOR =====
  function enumerateSubdomains() {
    const domain = document.getElementById("subdomainDomain").value.trim();
    const output = document.getElementById("subdomainOutput");
    if (!domain) {
      output.value = "Enter a domain first.";
      return;
    }

    output.value = `Example subdomains for ${domain}\n\n- www\n- mail\n- api\n- admin\n- login`;
  }

  // ===== DEMO BACKEND TOOLS =====
  function demoBackendTool(type) {
    const outputId = type === "whois" ? "whoisOutput" : "ipOutput";
    const statusId = type === "whois" ? "whoisStatus" : "ipStatus";
    const output = document.getElementById(outputId);
    const status = document.getElementById(statusId);

    output.value = `[DEMO MODE]\n\nThis feature requires a backend server to perform ${type === "whois" ? "WHOIS" : "IP"} lookups.\n\nIn production, this would connect to a serverless function or API endpoint.\n\nFor now, try the client-side tools like Password Generator or Hash Generator!`;
    status.innerHTML =
      '<i class="fas fa-info-circle"></i> Backend not configured. Demo response shown.';
  }

  // ===== PERSONAL SECURITY TOOLS =====
  const checklistData = {
    personal: [
      "Use a password manager for unique passwords",
      "Enable MFA on email, banking, and social accounts",
      "Turn on automatic updates for phone and laptop",
      "Review app permissions and remove unused apps",
      "Back up important files to a trusted location",
    ],
    student: [
      "Use a separate password for university accounts",
      "Protect email with MFA and recovery options",
      "Avoid sharing student portal screenshots or codes",
      "Keep assignment files backed up before deadlines",
      "Check links before opening scholarship or exam notices",
    ],
    business: [
      "Require MFA for admin and finance accounts",
      "Keep a list of devices, owners, and critical apps",
      "Patch operating systems and browsers regularly",
      "Back up business data and test restore steps",
      "Document who to contact during a security incident",
    ],
  };

  const scorecardQuestions = [
    "Do you use MFA on your most important accounts?",
    "Are your passwords unique across services?",
    "Are your devices set to update automatically?",
    "Do you back up important data regularly?",
    "Can you recognize common phishing warning signs?",
    "Do you lock your device when stepping away?",
    "Do you review account sessions or login alerts?",
    "Do you avoid downloading files from unknown senders?",
    "Do you know how to report a suspicious email?",
    "Do you have a recovery plan if an account is hacked?",
  ];

  const glossaryTerms = [
    ["CVE", "Common Vulnerabilities and Exposures, a public identifier for a known security flaw."],
    ["MFA", "Multi-factor authentication, which requires another proof besides a password."],
    ["SIEM", "Security information and event management, used to collect and analyze security logs."],
    ["EDR", "Endpoint detection and response, a toolset for monitoring and responding on devices."],
    ["Zero Trust", "A security model that continuously verifies users, devices, and access requests."],
    ["Phishing", "A social engineering attack that tricks people into sharing data or opening malicious links."],
    ["Ransomware", "Malware that encrypts or blocks access to data and demands payment."],
    ["IOC", "Indicator of compromise, such as a suspicious IP, hash, domain, or file path."],
    ["CISA KEV", "The Known Exploited Vulnerabilities catalog maintained by CISA."],
    ["Least Privilege", "Giving users and systems only the access they need to do their work."],
  ];

  function getStoredJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }

  function saveLearningDashboardMetric(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function renderSecurityChecklist() {
    const type = document.getElementById("securityChecklistType")?.value || "personal";
    const container = document.getElementById("securityChecklistItems");
    const progress = document.getElementById("securityChecklistProgress");
    if (!container || !progress) return;

    const key = `cm_security_checklist_${type}`;
    const checked = getStoredJson(key, []);
    const items = checklistData[type] || checklistData.personal;

    container.innerHTML = items
      .map(
        (item, index) => `
          <label class="checklist-item">
            <input type="checkbox" data-checklist-index="${index}" ${
              checked.includes(index) ? "checked" : ""
            } />
            <span>${item}</span>
          </label>
        `,
      )
      .join("");

    progress.textContent = `${checked.length} of ${items.length} complete`;
    saveLearningDashboardMetric("cm_checklist_progress", {
      type,
      complete: checked.length,
      total: items.length,
    });
  }

  function updateSecurityChecklist(e) {
    const checkbox = e.target.closest("[data-checklist-index]");
    if (!checkbox) return;

    const type = document.getElementById("securityChecklistType").value;
    const key = `cm_security_checklist_${type}`;
    const current = new Set(getStoredJson(key, []));
    const index = Number(checkbox.dataset.checklistIndex);

    if (checkbox.checked) current.add(index);
    else current.delete(index);

    localStorage.setItem(key, JSON.stringify([...current].sort((a, b) => a - b)));
    renderSecurityChecklist();
  }

  function analyzePhishingEmail() {
    const subject = document.getElementById("phishingSubject").value;
    const body = document.getElementById("phishingBody").value;
    const text = `${subject}\n${body}`.toLowerCase();
    const result = document.getElementById("phishingResult");
    const fill = document.getElementById("phishingRiskFill");
    const findings = [];
    let score = 0;

    const urgency = ["urgent", "immediately", "verify", "suspended", "limited", "expire"];
    const attachments = [".exe", ".scr", ".zip", ".iso", ".js", ".docm"];
    const links = text.match(/https?:\/\/[^\s)]+/g) || [];
    const urgencyHits = urgency.filter((word) => text.includes(word));

    if (urgencyHits.length) {
      score += Math.min(30, urgencyHits.length * 10);
      findings.push(`Urgency language found: ${urgencyHits.join(", ")}`);
    }
    if (links.length) {
      score += Math.min(25, links.length * 8);
      findings.push(`${links.length} link(s) found. Verify the domain before clicking.`);
    }
    if (links.some((link) => /bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd/.test(link))) {
      score += 20;
      findings.push("Shortened links can hide the real destination.");
    }
    if (links.some((link) => /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/.test(link))) {
      score += 20;
      findings.push("A link uses a raw IP address instead of a normal domain.");
    }

    const attachmentHits = attachments.filter((ext) => text.includes(ext));
    if (attachmentHits.length) {
      score += 20;
      findings.push(`Risky attachment references found: ${attachmentHits.join(", ")}`);
    }
    if (/password|otp|one-time|security code|login/.test(text)) {
      score += 15;
      findings.push("The message asks for login, password, or verification code action.");
    }

    score = Math.min(100, score);
    const label = score >= 70 ? "High Risk" : score >= 40 ? "Medium Risk" : "Low Risk";
    const color = score >= 70 ? "#ff4444" : score >= 40 ? "#f59e0b" : "#3ad86a";
    fill.style.width = `${score}%`;
    fill.style.background = color;
    result.innerHTML = `
      <div class="result-item">
        <h4 style="color:${color}">${label}: ${score}/100</h4>
        <p>${findings.length ? findings.join("</p><p>") : "No major phishing signals found. Still verify sender identity and links."}</p>
      </div>
    `;
  }

  function renderGlossary() {
    const query = (document.getElementById("glossarySearch")?.value || "").trim().toLowerCase();
    const container = document.getElementById("glossaryList");
    if (!container) return;

    const filtered = glossaryTerms.filter(
      ([term, definition]) =>
        term.toLowerCase().includes(query) ||
        definition.toLowerCase().includes(query),
    );

    container.innerHTML = filtered
      .map(([term, definition]) => `<div class="glossary-item"><h4>${term}</h4><p>${definition}</p></div>`)
      .join("");
  }

  function renderScorecard() {
    const answers = getStoredJson("cm_security_scorecard", {});
    const container = document.getElementById("scorecardQuestions");
    const result = document.getElementById("scorecardResult");
    if (!container || !result) return;

    container.innerHTML = scorecardQuestions
      .map(
        (question, index) => `
          <label class="checklist-item">
            <input type="checkbox" data-scorecard-index="${index}" ${
              answers[index] ? "checked" : ""
            } />
            <span>${question}</span>
          </label>
        `,
      )
      .join("");

    const score = Object.values(answers).filter(Boolean).length;
    const rating = score >= 8 ? "Strong" : score >= 5 ? "Good" : "Basic";
    result.textContent = `Score: ${score}/${scorecardQuestions.length} - ${rating}`;
    saveLearningDashboardMetric("cm_scorecard_result", {
      score,
      total: scorecardQuestions.length,
      rating,
    });
  }

  function updateScorecard(e) {
    const checkbox = e.target.closest("[data-scorecard-index]");
    if (!checkbox) return;
    const answers = getStoredJson("cm_security_scorecard", {});
    answers[checkbox.dataset.scorecardIndex] = checkbox.checked;
    localStorage.setItem("cm_security_scorecard", JSON.stringify(answers));
    renderScorecard();
  }

  function renderTimeline() {
    const list = document.getElementById("timelineList");
    const output = document.getElementById("timelineExport");
    if (!list || !output) return;
    const events = getStoredJson("cm_incident_timeline", []);

    list.innerHTML = events.length
      ? events
          .map(
            (event, index) => `
              <div class="timeline-item">
                <h4>${index + 1}. ${event.time || "No time"} - ${event.action}</h4>
                <p>${event.evidence || "No evidence noted"}</p>
              </div>
            `,
          )
          .join("")
      : '<div class="timeline-item"><p>No events added yet.</p></div>';

    output.value = events
      .map(
        (event, index) =>
          `${index + 1}. [${event.time || "No time"}] ${event.action}\nEvidence: ${
            event.evidence || "None"
          }`,
      )
      .join("\n\n");
  }

  function addTimelineEvent() {
    const time = document.getElementById("timelineTime").value.trim();
    const action = document.getElementById("timelineAction").value.trim();
    const evidence = document.getElementById("timelineEvidence").value.trim();
    if (!action) return;

    const events = getStoredJson("cm_incident_timeline", []);
    events.push({ time, action, evidence });
    localStorage.setItem("cm_incident_timeline", JSON.stringify(events));
    document.getElementById("timelineTime").value = "";
    document.getElementById("timelineAction").value = "";
    document.getElementById("timelineEvidence").value = "";
    renderTimeline();
  }

  function buildCveLinks() {
    const input = document.getElementById("cveInput").value.trim().toUpperCase();
    const output = document.getElementById("cveLinks");
    if (!/^CVE-\d{4}-\d{4,}$/.test(input)) {
      output.innerHTML =
        '<div class="result-item"><h4>Invalid CVE ID</h4><p>Use a format like CVE-2024-3094.</p></div>';
      return;
    }

    const encoded = encodeURIComponent(input);
    output.innerHTML = `
      <div class="result-item">
        <h4>${input}</h4>
        <p><a href="https://nvd.nist.gov/vuln/detail/${encoded}" target="_blank" rel="noopener">Open NVD detail</a></p>
        <p><a href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext=${encoded}" target="_blank" rel="noopener">Search CISA KEV catalog</a></p>
      </div>
    `;
  }

  // ===== INITIALIZATION =====
  document.addEventListener("DOMContentLoaded", () => {
    // Tool tab switching
    document.getElementById("toolSelector")?.addEventListener("click", (e) => {
      const tab = e.target.closest(".tool-tab");
      if (!tab) return;
      switchTool(tab.dataset.tool);
    });

    // Password Generator
    document
      .getElementById("passLength")
      ?.addEventListener("input", function () {
        document.getElementById("passLengthValue").textContent = this.value;
      });
    document
      .getElementById("generatePassword")
      ?.addEventListener("click", generatePassword);
    document
      .getElementById("copyPassword")
      ?.addEventListener("click", function () {
        const pass = document.getElementById("generatedPassword").value;
        if (pass && pass !== "Select at least one character type.") {
          copyToClipboard(pass, this);
        }
      });

    // Password Checker
    document
      .getElementById("passwordToCheck")
      ?.addEventListener("input", function () {
        const pass = this.value;
        if (pass) {
          document.getElementById("checkStrengthBar").style.display = "block";
          checkPasswordStrength(pass, "checkStrengthFill", "checkStrengthText");

          // Additional details
          const details = document.getElementById("checkDetails");
          let detailText = "";
          if (pass.length < 8)
            detailText += "• Too short (minimum 8 characters recommended)\n";
          if (!/[A-Z]/.test(pass)) detailText += "• Add uppercase letters\n";
          if (!/[a-z]/.test(pass)) detailText += "• Add lowercase letters\n";
          if (!/[0-9]/.test(pass)) detailText += "• Add numbers\n";
          if (!/[^A-Za-z0-9]/.test(pass))
            detailText += "• Add special characters\n";
          if (/password|admin|qwerty|123456|letmein/i.test(pass))
            detailText += "• Avoid common or reused-looking passwords\n";
          if (pass.length >= 20 && /[ -]/.test(pass))
            detailText += "• Good passphrase length. Keep it unique.\n";
          if (
            pass.length >= 16 &&
            /[A-Z]/.test(pass) &&
            /[a-z]/.test(pass) &&
            /[0-9]/.test(pass) &&
            /[^A-Za-z0-9]/.test(pass)
          ) {
            detailText = "✅ Excellent password!";
          }
          details.textContent = detailText;
        } else {
          document.getElementById("checkStrengthBar").style.display = "none";
          document.getElementById("checkStrengthText").textContent = "";
          document.getElementById("checkDetails").textContent = "";
        }
      });

    // Hash Generator
    document
      .getElementById("generateHash")
      ?.addEventListener("click", generateHash);
    document.getElementById("copyHash")?.addEventListener("click", function () {
      const hash = document.getElementById("hashOutput").value;
      if (hash) copyToClipboard(hash, this);
    });

    // Base64
    document
      .getElementById("encodeBase64")
      ?.addEventListener("click", encodeBase64);
    document
      .getElementById("decodeBase64")
      ?.addEventListener("click", decodeBase64);
    document
      .getElementById("copyB64Encoded")
      ?.addEventListener("click", function () {
        const val = document.getElementById("b64EncodeOutput").value;
        if (val) copyToClipboard(val, this);
      });
    document
      .getElementById("copyB64Decoded")
      ?.addEventListener("click", function () {
        const val = document.getElementById("b64DecodeOutput").value;
        if (val) copyToClipboard(val, this);
      });

    // URL
    document.getElementById("encodeURL")?.addEventListener("click", encodeURL);
    document.getElementById("decodeURL")?.addEventListener("click", decodeURL);
    document
      .getElementById("copyURLEncoded")
      ?.addEventListener("click", function () {
        const val = document.getElementById("urlEncodeOutput").value;
        if (val) copyToClipboard(val, this);
      });
    document
      .getElementById("copyURLDecoded")
      ?.addEventListener("click", function () {
        const val = document.getElementById("urlDecodeOutput").value;
        if (val) copyToClipboard(val, this);
      });

    // JSON
    document
      .getElementById("formatJSON")
      ?.addEventListener("click", formatJSON);
    document
      .getElementById("minifyJSON")
      ?.addEventListener("click", minifyJSON);
    document
      .getElementById("validateJSON")
      ?.addEventListener("click", validateJSON);
    document.getElementById("copyJSON")?.addEventListener("click", function () {
      const val = document.getElementById("jsonOutput").value;
      if (val) copyToClipboard(val, this);
    });

    // Text Case Converter
    document
      .getElementById("convertTextCase")
      ?.addEventListener("click", convertTextCase);
    document
      .getElementById("copyTextCase")
      ?.addEventListener("click", function () {
        const val = document.getElementById("textCaseOutput").value;
        if (val) copyToClipboard(val, this);
      });

    // UUID Generator
    document
      .getElementById("generateUUID")
      ?.addEventListener("click", generateUUID);
    document.getElementById("copyUUID")?.addEventListener("click", function () {
      const val = document.getElementById("uuidOutput").value;
      if (val) copyToClipboard(val, this);
    });

    // Hex Converter
    document.getElementById("encodeHex")?.addEventListener("click", encodeHex);
    document.getElementById("decodeHex")?.addEventListener("click", decodeHex);
    document.getElementById("copyHex")?.addEventListener("click", function () {
      const val = document.getElementById("hexOutput").value;
      if (val) copyToClipboard(val, this);
    });

    // New tools
    document
      .getElementById("generateChecklist")
      ?.addEventListener("click", generateChecklist);
    document
      .getElementById("copyChecklist")
      ?.addEventListener("click", function () {
        const val = document.getElementById("checklistOutput").value;
        if (val) copyToClipboard(val, this);
      });

    document.getElementById("decodeJWT")?.addEventListener("click", decodeJWT);
    document.getElementById("copyJWT")?.addEventListener("click", function () {
      const val = document.getElementById("jwtOutput").value;
      if (val) copyToClipboard(val, this);
    });

    document
      .getElementById("sanitizeData")
      ?.addEventListener("click", sanitizeData);
    document
      .getElementById("copySanitize")
      ?.addEventListener("click", function () {
        const val = document.getElementById("sanitizeOutput").value;
        if (val) copyToClipboard(val, this);
      });

    document.getElementById("testRegex")?.addEventListener("click", testRegex);
    document
      .getElementById("checkSSL")
      ?.addEventListener("click", checkSSLSetup);
    document
      .getElementById("checkHeaders")
      ?.addEventListener("click", checkHeaders);
    document
      .getElementById("analyzeCORS")
      ?.addEventListener("click", analyzeCORS);
    document
      .getElementById("calculateFileHash")
      ?.addEventListener("click", calculateFileHash);
    document.getElementById("fileHashInput")?.addEventListener("change", function () {
      const fileName = this.files[0]?.name || "No file selected";
      const label = document.getElementById("fileHashName");
      if (label) label.textContent = fileName;
    });
    document.getElementById("checkDiff")?.addEventListener("click", checkDiff);
    document
      .getElementById("enumerateSubdomains")
      ?.addEventListener("click", enumerateSubdomains);

    // Personal security tools
    document
      .getElementById("securityChecklistType")
      ?.addEventListener("change", renderSecurityChecklist);
    document
      .getElementById("securityChecklistItems")
      ?.addEventListener("change", updateSecurityChecklist);
    document
      .getElementById("resetSecurityChecklist")
      ?.addEventListener("click", () => {
        const type = document.getElementById("securityChecklistType").value;
        localStorage.removeItem(`cm_security_checklist_${type}`);
        renderSecurityChecklist();
      });
    renderSecurityChecklist();

    document
      .getElementById("analyzePhishing")
      ?.addEventListener("click", analyzePhishingEmail);

    document
      .getElementById("glossarySearch")
      ?.addEventListener("input", renderGlossary);
    renderGlossary();

    document
      .getElementById("scorecardQuestions")
      ?.addEventListener("change", updateScorecard);
    document.getElementById("resetScorecard")?.addEventListener("click", () => {
      localStorage.removeItem("cm_security_scorecard");
      renderScorecard();
    });
    renderScorecard();

    document
      .getElementById("addTimelineEvent")
      ?.addEventListener("click", addTimelineEvent);
    document.getElementById("copyTimeline")?.addEventListener("click", function () {
      const val = document.getElementById("timelineExport").value;
      if (val) copyToClipboard(val, this);
    });
    renderTimeline();

    document
      .getElementById("buildCveLinks")
      ?.addEventListener("click", buildCveLinks);

    // Backend tools (demo)
    document
      .getElementById("lookupWhois")
      ?.addEventListener("click", () => demoBackendTool("whois"));
    document
      .getElementById("lookupIP")
      ?.addEventListener("click", () => demoBackendTool("ip"));
  });
})();
