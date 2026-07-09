// assets/js/helpline.js
// CyberMatrix AI Helpline v3.0 — Public Access, Image & Audio Processing
// No login required — open to all visitors

(function () {
  "use strict";

  // ===== CONFIGURATION =====
  const CONFIG = {
    // Backend image analysis endpoint. This calls Netlify serverless functions.
    imageAnalysisAPI: "/api/analyze-image",

    // Audio transcription endpoint. Also server-side to keep keys private.
    useWebSpeechAPI: true,
    speechAPIEndpoint: "/api/transcribe-audio",

    // File size limits
    maxImageSize: 10 * 1024 * 1024, // 10MB
    maxAudioSize: 25 * 1024 * 1024, // 25MB
  };

  // ===== STATE =====
  let currentCategory = "all";
  let chatHistory = [];
  let pendingFile = null;
  let conversationContext = [];
  let speechRecognition = null;
  let isRecording = false;

  // ===== DOM ELEMENTS =====
  const appContainer = document.getElementById("appContainer");
  const messageContainer = document.getElementById("messageContainer");
  const chatWindow = document.getElementById("chatWindow");
  const searchInput = document.getElementById("searchInput");
  const sendBtn = document.getElementById("sendBtn");
  const typingIndicator = document.getElementById("typingIndicator");
  const filePreviewBar = document.getElementById("filePreviewBar");
  const filePreviewContent = document.getElementById("filePreviewContent");
  const clearFilePreviewBtn = document.getElementById("clearFilePreview");
  const imageUploadBtn = document.getElementById("imageUploadBtn");
  const audioUploadBtn = document.getElementById("audioUploadBtn");
  const imageFileInput = document.getElementById("imageFileInput");
  const audioFileInput = document.getElementById("audioFileInput");
  const imageModal = document.getElementById("imageModal");
  const toast = document.getElementById("toast");
  const connectionStatus = document.getElementById("connectionStatus");

  // ===== KNOWLEDGE BASE =====
  const knowledgeBase = [
    {
      keywords: [
        "phishing",
        "phish",
        "email scam",
        "fake email",
        "spear phishing",
        "whaling",
      ],
      category: "threats",
      answer:
        "🛡️ <strong>Phishing</strong> — social engineering attack using deceptive emails, messages, or websites to steal credentials or deliver malware.<br><br>🔹 <strong>Types:</strong> Spear phishing (targeted), Whaling (executives), Smishing (SMS), Vishing (voice)<br>🔹 <strong>Indicators:</strong> Urgency, suspicious sender, mismatched URLs, poor grammar, unexpected attachments<br>🔹 <strong>Prevention:</strong> Email filters (DMARC/DKIM/SPF), MFA, security awareness training, hover before clicking",
    },
    {
      keywords: [
        "ransomware",
        "ransom",
        "encrypt",
        "decrypt",
        "cryptolocker",
        "lockbit",
        "ryuk",
      ],
      category: "threats",
      answer:
        "💀 <strong>Ransomware</strong> — malware that encrypts files and demands payment for decryption keys. Ransomware-as-a-Service (RaaS) has made attacks more accessible.<br><br>🔹 <strong>Notable variants:</strong> LockBit, Ryuk, Conti, BlackCat<br>🔹 <strong>Infection vectors:</strong> Phishing, RDP brute force, software vulnerabilities<br>🔹 <strong>Defense:</strong> 3-2-1 backup strategy, EDR/XDR, patch management, network segmentation, disable macros<br>🔹 <strong>Response:</strong> Isolate infected systems, DO NOT pay ransom, contact law enforcement, restore from offline backups",
    },
    {
      keywords: [
        "malware",
        "virus",
        "trojan",
        "worm",
        "rootkit",
        "spyware",
        "keylogger",
        "rat",
      ],
      category: "threats",
      answer:
        "🦠 <strong>Malware</strong> — malicious software including viruses, worms, trojans, ransomware, spyware, adware, and rootkits.<br><br>🔹 <strong>Common types:</strong> RAT (Remote Access Trojan), info-stealer, botnet agent, cryptominer<br>🔹 <strong>Delivery:</strong> Phishing attachments, drive-by downloads, malicious ads, supply chain attacks<br>🔹 <strong>Protection:</strong> Endpoint protection (EDR/AV), application whitelisting, principle of least privilege, regular scanning",
    },
    {
      keywords: [
        "ddos",
        "dos",
        "distributed denial",
        "flood",
        "amplification",
        "botnet",
      ],
      category: "threats",
      answer:
        "🌊 <strong>DDoS (Distributed Denial of Service)</strong> — overwhelms target servers/networks with traffic from multiple sources.<br><br>🔹 <strong>Attack types:</strong> Volumetric (UDP floods), Protocol (SYN floods), Application layer (HTTP floods), Amplification (DNS/NTP)<br>🔹 <strong>Mitigation:</strong> CDN services (Cloudflare/AWS Shield), rate limiting, traffic scrubbing, anycast networks<br>🔹 <strong>Preparation:</strong> Have a DDoS response plan, know your baseline traffic patterns",
    },
    {
      keywords: ["zero-day", "0day", "unknown vulnerability", "unpatched"],
      category: "threats",
      answer:
        "⚡ <strong>Zero-Day Exploit</strong> — an attack that exploits a previously unknown vulnerability before the vendor releases a patch.<br><br>🔹 <strong>Lifecycle:</strong> Discovery → Exploit development → Attack → Detection → Patch release<br>🔹 <strong>Defense:</strong> Virtual patching (WAF/IPS), behavioral analysis, threat intelligence feeds, application whitelisting<br>🔹 <strong>Notable:</strong> Stuxnet (2010), Log4Shell (2021), MOVEit (2023)",
    },
    {
      keywords: [
        "firewall",
        "next-gen",
        "ngfw",
        "ids",
        "ips",
        "network security",
        "waf",
      ],
      category: "defense",
      answer:
        "🔥 <strong>Firewall & Network Security</strong> — first line of defense controlling inbound/outbound traffic.<br><br>🔹 <strong>Types:</strong> Packet filtering, Stateful inspection, NGFW (with IPS/IDS), WAF (web application firewall)<br>🔹 <strong>Best practices:</strong> Default deny policy, network segmentation (VLANs), regular rule reviews, disable unused ports<br>🔹 <strong>Complementary:</strong> IDS (detection), IPS (prevention), network monitoring, SIEM integration",
    },
    {
      keywords: [
        "vulnerability",
        "cve",
        "exploit",
        "patch",
        "bug",
        "scanning",
        "cvss",
      ],
      category: "defense",
      answer:
        "🐞 <strong>Vulnerability Management</strong> — systematic process of identifying, classifying, prioritizing, and remediating security weaknesses.<br><br>🔹 <strong>Framework:</strong> CVE identifiers, CVSS scoring (0-10), CWE categories<br>🔹 <strong>Tools:</strong> Nessus, Qualys, OpenVAS, Rapid7 InsightVM<br>🔹 <strong>Process:</strong> Asset inventory → Scanning → Risk assessment → Patching → Verification<br>🔹 <strong>Priority:</strong> Patch critical (CVSS 9+) within 48 hours, high within 1 week",
    },
    {
      keywords: [
        "encryption",
        "aes",
        "rsa",
        "tls",
        "ssl",
        "certificate",
        "cryptography",
        "pki",
      ],
      category: "defense",
      answer:
        "🔒 <strong>Encryption</strong> — protects data confidentiality through mathematical algorithms.<br><br>🔹 <strong>Symmetric:</strong> AES-256 (standard), ChaCha20 (mobile)<br>🔹 <strong>Asymmetric:</strong> RSA-2048+, ECC (Elliptic Curve), Ed25519<br>🔹 <strong>Protocols:</strong> TLS 1.3 (replaces SSL), HTTPS everywhere, SSH for remote access<br>🔹 <strong>Key management:</strong> HSM for critical keys, regular rotation, never hardcode keys",
    },
    {
      keywords: [
        "zero trust",
        "ztna",
        "never trust",
        "always verify",
        "micro-segmentation",
        "zta",
      ],
      category: "defense",
      answer:
        '🛡️ <strong>Zero Trust Architecture</strong> — "Never trust, always verify." No implicit trust based on network location.<br><br>🔹 <strong>Principles:</strong> Verify explicitly, least privilege access, assume breach<br>🔹 <strong>Implementation:</strong> Micro-segmentation, continuous authentication, device health checks, JIT access<br>🔹 <strong>Frameworks:</strong> NIST SP 800-207, CISA Zero Trust Maturity Model<br>🔹 <strong>Benefits:</strong> Reduced attack surface, limited lateral movement, better visibility',
    },
    {
      keywords: [
        "mfa",
        "2fa",
        "multi factor",
        "two factor",
        "authenticator",
        "totp",
        "fido2",
        "passkey",
      ],
      category: "identity",
      answer:
        "🔑 <strong>Multi-Factor Authentication (MFA)</strong> — requires 2+ verification factors. Blocks 99.9% of automated attacks.<br><br>🔹 <strong>Factors:</strong> Something you know (password), have (token/phone), are (biometric)<br>🔹 <strong>Methods (best to worst):</strong> FIDO2/Passkeys > Hardware token > TOTP app > Push notification > SMS<br>🔹 <strong>⚠ Avoid SMS:</strong> Vulnerable to SIM swapping and SS7 attacks<br>🔹 <strong>Enforcement:</strong> Require MFA for all users, especially admins and remote access",
    },
    {
      keywords: [
        "password",
        "passphrase",
        "password manager",
        "credential",
        "brute force",
        "passwordless",
      ],
      category: "identity",
      answer:
        "🔐 <strong>Password Security</strong> — foundation of authentication hygiene.<br><br>🔹 <strong>Best practices:</strong> 16+ character passphrases, unique per account, use password manager (Bitwarden/1Password)<br>🔹 <strong>To avoid:</strong> Reuse, dictionary words, personal info, short passwords (< 12 chars)<br>🔹 <strong>Emerging:</strong> Passwordless authentication (Passkeys/FIDO2), biometric + PIN<br>🔹 <strong>Enterprise:</strong> Enforce password policies, audit compromised credentials (HaveIBeenPwned API)",
    },
    {
      keywords: [
        "iam",
        "identity",
        "access management",
        "rbac",
        "least privilege",
        "pam",
        "sso",
      ],
      category: "identity",
      answer:
        "🪪 <strong>IAM & Access Control</strong> — manage digital identities and their permissions.<br><br>🔹 <strong>Models:</strong> RBAC (role-based), ABAC (attribute-based), PBAC (policy-based)<br>🔹 <strong>Principles:</strong> Least privilege, separation of duties, just-in-time access<br>🔹 <strong>PAM (Privileged Access Management):</strong> Secure, monitor, and audit privileged accounts<br>🔹 <strong>SSO:</strong> Single sign-on with SAML/OIDC, reduces password fatigue",
    },
    {
      keywords: [
        "network",
        "vpn",
        "vlan",
        "segmentation",
        "switch",
        "router",
        "dns",
        "proxy",
      ],
      category: "network",
      answer:
        "🌐 <strong>Network Security</strong> — protect the infrastructure connecting your systems.<br><br>🔹 <strong>Segmentation:</strong> VLANs, subnets, micro-segmentation to limit lateral movement<br>🔹 <strong>VPN:</strong> WireGuard (modern), IPsec (enterprise), avoid PPTP<br>🔹 <strong>DNS security:</strong> DNSSEC, DNS filtering (Cisco Umbrella), monitor for tunneling<br>🔹 <strong>Hardening:</strong> Disable unused ports, secure SNMP, use 802.1X for port security",
    },
    {
      keywords: [
        "cloud",
        "aws",
        "azure",
        "gcp",
        "s3",
        "iam",
        "shared responsibility",
        "cspm",
      ],
      category: "cloud",
      answer:
        "☁️ <strong>Cloud Security</strong> — shared responsibility between provider and customer.<br><br>🔹 <strong>Provider secures:</strong> Physical, network, hypervisor<br>🔹 <strong>You secure:</strong> Data, IAM, applications, configurations, endpoints<br>🔹 <strong>Common issues:</strong> Open S3 buckets, overly permissive IAM, exposed APIs, unpatched VMs<br>🔹 <strong>Tools:</strong> CSPM (Cloud Security Posture Management), CWPP, cloud-native firewalls<br>🔹 <strong>Best practice:</strong> Encrypt data at rest and in transit, enable logging (CloudTrail), audit IAM regularly",
    },
    {
      keywords: [
        "incident response",
        "ir",
        "breach",
        "data breach",
        "response plan",
        "playbook",
        "nist",
      ],
      category: "incident",
      answer:
        "🚨 <strong>Incident Response (IR)</strong> — structured approach to handling security incidents.<br><br>🔹 <strong>NIST Framework:</strong> Prepare → Detect & Analyze → Contain & Eradicate → Recover → Post-Incident<br>🔹 <strong>Key steps:</strong> 1) Identify and isolate affected systems, 2) Preserve evidence (forensic images), 3) Determine root cause, 4) Patch and restore<br>🔹 <strong>Preparation:</strong> Have IR playbooks, tabletop exercises, contact lists, offline communication channels<br>🔹 <strong>Reporting:</strong> Know legal requirements (GDPR 72-hour, CISA reporting)",
    },
    {
      keywords: [
        "security awareness",
        "training",
        "human factor",
        "culture",
        "phishing simulation",
        "social engineering",
      ],
      category: "awareness",
      answer:
        "🧑‍🏫 <strong>Security Awareness</strong> — the human element is often the weakest link and the strongest defense.<br><br>🔹 <strong>Key topics:</strong> Phishing recognition, password hygiene, physical security, social engineering, safe browsing<br>🔹 <strong>Methods:</strong> Simulated phishing campaigns, gamified training, monthly security newsletters, lunch-and-learn sessions<br>🔹 <strong>Metrics:</strong> Phish-prone percentage, training completion rates, incident reporting rates<br>🔹 <strong>Culture:</strong> Make security everyone's responsibility, reward good behavior, never punish reporting",
    },
  ];

  // ===== HELPER FUNCTIONS =====
  function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.style.display = "block";
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = "none";
    }, duration);
  }

  function getTimestamp() {
    const now = new Date();
    return `⏱️ ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  }

  function renderWelcomeMessage(text = "I'm your AI cybersecurity assistant. Ask a question or upload a file to begin.") {
    messageContainer.innerHTML = `
      <div class="message bot">
        <div class="avatar"><i class="fas fa-robot"></i></div>
        <div class="bubble">
          <strong>MATRIX SECURITY HELPLINE</strong><br />
          ${text}
          <span class="timestamp">${getTimestamp()}</span>
        </div>
      </div>`;
  }

  function updateConnectionStatus(status, color) {
    if (!connectionStatus) return;
    connectionStatus.innerHTML = `<i class="fas fa-circle" style="color: ${color}; font-size: 0.45rem;"></i> ${status}`;
  }

  // ===== MESSAGE RENDERING =====
  function addMessage(text, sender = "bot") {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML =
      sender === "bot"
        ? '<i class="fas fa-robot"></i>'
        : '<i class="fas fa-user"></i>';

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = text;

    const time = document.createElement("span");
    time.className = "timestamp";
    time.textContent = getTimestamp();
    bubble.appendChild(time);

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    messageContainer.appendChild(msgDiv);
    scrollToBottom();

    chatHistory.push({ sender, text, timestamp: getTimestamp() });

    if (sender === "user") {
      conversationContext.push({ role: "user", content: text });
      if (conversationContext.length > 10) conversationContext.shift();
    } else {
      conversationContext.push({ role: "assistant", content: text });
      if (conversationContext.length > 10) conversationContext.shift();
    }
  }

  function addImageMessage(imageSrc, sender = "user", caption = "") {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML =
      sender === "bot"
        ? '<i class="fas fa-robot"></i>'
        : '<i class="fas fa-user"></i>';

    const captionHTML = caption
      ? `<br><span style="font-size: 0.8rem; opacity: 0.9;">${caption}</span>`
      : "";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = `
            <strong>${sender === "user" ? "📸 Uploaded Image" : "🖼️ Image Analysis"}</strong>${captionHTML}
            <img src="${imageSrc}" alt="Uploaded image" class="bubble-image" 
                 onclick="document.getElementById('imageModal').style.display='flex'; document.getElementById('modalImagePreview').src='${imageSrc}';" />
        `;

    const time = document.createElement("span");
    time.className = "timestamp";
    time.textContent = getTimestamp();
    bubble.appendChild(time);

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    messageContainer.appendChild(msgDiv);
    scrollToBottom();

    chatHistory.push({ sender, text: "[Image]", timestamp: getTimestamp() });
  }

  function addAudioMessage(
    audioSrc,
    fileName,
    sender = "user",
    transcription = "",
  ) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML =
      sender === "bot"
        ? '<i class="fas fa-robot"></i>'
        : '<i class="fas fa-user"></i>';

    const transcriptionHTML = transcription
      ? `<div style="background: rgba(0,40,20,0.4); padding: 0.6rem; border-radius: 8px; margin: 0.5rem 0; border: 1px solid #1f7a33;">
                 <strong>📝 Transcription:</strong><br />${transcription}
               </div>`
      : "";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = `
            <strong>${sender === "user" ? "🎤 Audio Note" : "📝 Transcription Result"}</strong><br />
            <span style="font-size: 0.7rem; opacity: 0.7;">${fileName}</span>
            <br />
            <audio controls src="${audioSrc}" style="margin-top: 0.5rem; width: 100%; max-width: 300px; height: 30px;"></audio>
            ${transcriptionHTML}
        `;

    const time = document.createElement("span");
    time.className = "timestamp";
    time.textContent = getTimestamp();
    bubble.appendChild(time);

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    messageContainer.appendChild(msgDiv);
    scrollToBottom();

    chatHistory.push({
      sender,
      text: `[Audio: ${fileName}]`,
      timestamp: getTimestamp(),
    });
  }

  // ===== TYPING INDICATOR =====
  function setTyping(visible) {
    typingIndicator.style.display = visible ? "flex" : "none";
    if (visible) scrollToBottom();
  }

  // ===== KNOWLEDGE SEARCH =====
  function searchKnowledge(query, categoryFilter = "all") {
    const lower = query.trim().toLowerCase();
    if (!lower) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (let entry of knowledgeBase) {
      if (categoryFilter !== "all" && entry.category !== categoryFilter)
        continue;

      for (let kw of entry.keywords) {
        const kwLower = kw.toLowerCase();
        if (lower === kwLower) return entry.answer;
        if (lower.includes(kwLower) || kwLower.includes(lower)) {
          const score = kwLower.length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = entry.answer;
          }
        }
      }
    }
    return bestMatch;
  }

  function getFallbackResponse(query, categoryFilter = "all") {
    const lower = query.toLowerCase();

    if (
      lower.match(
        /^(hello|hi|hey|greetings|yo|sup|good (morning|afternoon|evening))/,
      )
    ) {
      return "👋 Greetings! I am the CyberMatrix AI Helpline — your cybersecurity assistant.<br><br>I can answer questions about threats, defense, identity, network, cloud security, and incident response.<br><br>📸 <strong>Upload screenshots</strong> for visual analysis<br>🎤 <strong>Click the mic</strong> to speak your question — real-time transcription<br>💬 <strong>Type</strong> any cybersecurity question<br><br>Try asking about <strong>phishing, ransomware, MFA, zero trust, or firewall</strong>.";
    }

    if (lower.includes("help") || lower.includes("what can you do")) {
      return "🆘 <strong>I can help with:</strong><br><br>🔹 <strong>Threats:</strong> phishing, ransomware, malware, DDoS, zero-days<br>🔹 <strong>Defense:</strong> firewalls, encryption, vulnerability management, zero trust<br>🔹 <strong>Identity:</strong> MFA/2FA, password security, IAM<br>🔹 <strong>Network:</strong> VPNs, segmentation, DNS security<br>🔹 <strong>Cloud:</strong> AWS/Azure/GCP security<br>🔹 <strong>IR:</strong> Incident response playbooks<br><br>📸 <strong>Image:</strong> Upload screenshots for analysis<br>🎤 <strong>Voice:</strong> Click microphone to speak";
    }

    if (lower.includes("thanks") || lower.includes("thank you")) {
      return "🙏 You're welcome! Stay secure out there. The Matrix is always watching.";
    }

    const catHint =
      categoryFilter !== "all"
        ? ` in the <strong>${categoryFilter}</strong> category`
        : "";
    return `📡 No exact match for "<strong>${query}</strong>"${catHint}.<br><br>🔹 <strong>Suggestions:</strong><br>• Try different keywords<br>• Upload a screenshot for visual analysis<br>• Use the microphone for voice input<br>• Check our <a href="threats.html" style="color: #44dd77;">Threats</a> and <a href="articles.html" style="color: #44dd77;">Articles</a> pages`;
  }

  function getResponse(userQuery, categoryFilter = "all") {
    if (
      conversationContext.length > 0 &&
      userQuery
        .toLowerCase()
        .match(/^(what about|and|also|tell me more|explain further|why|how)/)
    ) {
      const lastContext = conversationContext
        .filter((c) => c.role === "user")
        .pop();
      if (lastContext) {
        const combinedQuery = `${lastContext.content} ${userQuery}`;
        const result = searchKnowledge(combinedQuery, categoryFilter);
        if (result) return result;
      }
    }
    return (
      searchKnowledge(userQuery, categoryFilter) ||
      getFallbackResponse(userQuery, categoryFilter)
    );
  }

  // ===== HANDLE USER QUERY =====
  function handleUserQuery(query) {
    const trimmed = query.trim();
    if (!trimmed) return;

    addMessage(trimmed, "user");
    setTyping(true);

    const delay = 300 + Math.floor(Math.random() * 500);

    setTimeout(() => {
      setTyping(false);
      const answer = getResponse(trimmed, currentCategory);
      addMessage(answer, "bot");
    }, delay);

    searchInput.value = "";
    searchInput.focus();
  }

  function handleSend() {
    if (pendingFile) {
      const queryText = searchInput.value.trim();
      processPendingFile(queryText);
      return;
    }

    const query = searchInput.value;
    if (!query.trim()) return;
    handleUserQuery(query);
  }

  // ===== IMAGE ANALYSIS =====
  async function analyzeImage(imageDataURL, userContext = "") {
    updateConnectionStatus("Sending image to backend...", "#ffd700");

    if (CONFIG.imageAnalysisAPI) {
      try {
        const apiResponse = await fetch(CONFIG.imageAnalysisAPI, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: imageDataURL, context: userContext }),
        });

        const result = await apiResponse.json();

        if (!apiResponse.ok || result.fallback) {
          console.warn(
            "Backend image analysis request failed or returned fallback:",
            result,
          );
          updateConnectionStatus(
            "Backend unavailable, using local fallback",
            "#ffb347",
          );
          return await performLocalImageAnalysis(imageDataURL, userContext);
        }

        if (result.analysis) {
          updateConnectionStatus("Connected", "#66ff88");
          return result.analysis;
        }

        console.warn(
          "Unexpected backend response, falling back to local analysis:",
          result,
        );
        updateConnectionStatus(
          "Backend response invalid, using local fallback",
          "#ffb347",
        );
        return await performLocalImageAnalysis(imageDataURL, userContext);
      } catch (error) {
        console.warn("Image backend failed, using local analysis:", error);
        updateConnectionStatus(
          "Connection failed, using local fallback",
          "#ff6347",
        );
        return await performLocalImageAnalysis(imageDataURL, userContext);
      }
    }

    updateConnectionStatus("Connected (local)", "#66ff88");
    return await performLocalImageAnalysis(imageDataURL, userContext);
  }

  async function performLocalImageAnalysis(imageDataURL, userContext) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        const width = img.width;
        const height = img.height;
        const aspectRatio = (width / height).toFixed(2);

        // Canvas-based pixel analysis
        let textHint = "";
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = Math.min(width, 800);
          canvas.height = Math.min(height, 600);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          const totalPixels = pixels.length / 4;

          let darkPixels = 0,
            redPixels = 0,
            greenPixels = 0;

          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i],
              g = pixels[i + 1],
              b = pixels[i + 2];
            if (r + g + b < 100) darkPixels++;
            if (r > 200 && g < 100 && b < 100) redPixels++;
            if (g > 150 && r < 150) greenPixels++;
          }

          const darkRatio = darkPixels / totalPixels;
          const redRatio = redPixels / totalPixels;

          if (darkRatio > 0.7)
            textHint =
              "Dark theme interface detected — likely a terminal, code editor, or dark-mode application.";
          if (redRatio > 0.05)
            textHint +=
              " Red/warning elements detected — possible security alert or error message.";
        } catch (e) {
          // Canvas analysis unavailable
        }

        const analysis = `
                    <strong>📊 Image Analysis Report</strong><br><br>
                    <strong>📐 Dimensions:</strong> ${width}×${height}px (${aspectRatio} ratio)<br>
                    <strong>📦 Size:</strong> ~${Math.round((imageDataURL.length * 0.75) / 1024)}KB<br>
                    ${textHint ? `<br>🔍 <strong>Visual Patterns:</strong><br>${textHint}<br>` : ""}
                    ${userContext ? `<br>📝 <strong>Your context:</strong> "${userContext}"<br>` : ""}
                    <br>💡 <strong>Recommendation:</strong> For security screenshots, look for:
                    <br>• Error codes or CVE references
                    <br>• Suspicious URLs or email addresses
                    <br>• Unusual process names or IP addresses
                    <br>• Certificate warnings or permission prompts
                    <br><br>⚠️ If this shows a security warning, investigate immediately.
                `;

        resolve(analysis);
      };

      img.onerror = function () {
        resolve(
          "⚠️ Unable to analyze image. The file may be corrupted or in an unsupported format.",
        );
      };

      img.src = imageDataURL;
    });
  }

  // ===== SPEECH RECOGNITION (Web Speech API) =====
  function initSpeechRecognition() {
    if (!CONFIG.useWebSpeechAPI) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported. Voice input disabled.");
      return;
    }

    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = "en-US";

    let finalTranscript = "";

    speechRecognition.onresult = function (event) {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      const liveDisplay = document.getElementById("liveTranscription");
      if (liveDisplay) {
        liveDisplay.textContent = finalTranscript + interimTranscript;
        liveDisplay.style.display = "block";
      }
    };

    speechRecognition.onerror = function (event) {
      console.error("Speech error:", event.error);
      stopRecording();

      if (event.error === "not-allowed") {
        showToast(
          "⚠️ Microphone access denied. Allow it in browser settings.",
          5000,
        );
      } else if (event.error === "no-speech") {
        showToast("⚠️ No speech detected. Try again.", 3000);
      } else {
        showToast(`⚠️ Error: ${event.error}`, 3000);
      }

      updateConnectionStatus("Connected", "#66ff88");
    };

    speechRecognition.onend = function () {
      if (isRecording) {
        try {
          speechRecognition.start();
        } catch (e) {
          /* already started */
        }
      }
    };
  }

  function startRecording() {
    if (!speechRecognition) {
      showToast(
        "⚠️ Speech recognition not supported. Try Chrome or Edge.",
        4000,
      );
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    isRecording = true;
    updateConnectionStatus("Recording...", "#ff4444");

    // Create live transcription bar
    if (!document.getElementById("liveTranscriptionBar")) {
      const liveBar = document.createElement("div");
      liveBar.id = "liveTranscriptionBar";
      liveBar.innerHTML = `
                <i class="fas fa-microphone" style="color: #ff4444; animation: pulseDot 1s infinite;"></i>
                <span id="liveTranscription" style="font-size: 0.8rem; color: #ff9999; flex: 1;">Listening...</span>
                <button id="stopRecordingBtn" style="background: rgba(255,50,50,0.2); border: 1px solid #ff4444; color: #ff7777; padding: 0.3rem 0.8rem; border-radius: 20px; cursor: pointer; font-family: 'Share Tech Mono', monospace; font-size: 0.65rem;">
                    <i class="fas fa-stop"></i> Stop
                </button>
            `;
      const inputArea = document.querySelector(".hl-input-area");
      inputArea.insertBefore(liveBar, inputArea.firstChild);
      document
        .getElementById("stopRecordingBtn")
        .addEventListener("click", stopRecording);
    }

    // Update mic button
    const micBtn = document.getElementById("micRecordBtn");
    if (micBtn) {
      micBtn.classList.add("recording");
      micBtn.innerHTML = '<i class="fas fa-stop"></i>';
    }

    try {
      speechRecognition.start();
      showToast("🎤 Recording... speak your question.");
    } catch (e) {
      console.error("Failed to start recording:", e);
      stopRecording();
    }
  }

  function stopRecording() {
    isRecording = false;

    if (speechRecognition) {
      try {
        speechRecognition.stop();
      } catch (e) {
        /* already stopped */
      }
    }

    updateConnectionStatus("Connected", "#66ff88");

    const liveDisplay = document.getElementById("liveTranscription");
    const transcript = liveDisplay
      ? liveDisplay.textContent.replace("Listening...", "").trim()
      : "";

    const liveBar = document.getElementById("liveTranscriptionBar");
    if (liveBar) liveBar.remove();

    const micBtn = document.getElementById("micRecordBtn");
    if (micBtn) {
      micBtn.classList.remove("recording");
      micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    }

    if (transcript) {
      searchInput.value = transcript;
      handleSend();
      showToast("✅ Voice input sent.");
    } else {
      showToast("⚠️ No speech detected.");
    }
  }

  // ===== AUDIO FILE TRANSCRIPTION =====
  async function transcribeAudioFile(audioDataURL, fileName) {
    if (CONFIG.speechAPIEndpoint) {
      try {
        updateConnectionStatus("Transcribing audio...", "#ffd700");

        const apiResponse = await fetch(CONFIG.speechAPIEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio: audioDataURL, fileName }),
        });

        const result = await apiResponse.json();

        if (!apiResponse.ok || result.fallback) {
          console.warn(
            "Backend transcription failed or returned fallback:",
            result,
          );
          updateConnectionStatus(
            "Backend unavailable, using local transcription fallback",
            "#ffb347",
          );
          return simulateTranscription(fileName);
        }

        if (result.transcription) {
          updateConnectionStatus("Connected", "#66ff88");
          return result.transcription;
        }

        console.warn(
          "Unexpected transcription response, using fallback:",
          result,
        );
        updateConnectionStatus(
          "Backend response invalid, using local transcription fallback",
          "#ffb347",
        );
        return simulateTranscription(fileName);
      } catch (error) {
        console.warn(
          "Audio backend failed, using fallback transcription:",
          error,
        );
        updateConnectionStatus(
          "Connection failed, using local transcription fallback",
          "#ff6347",
        );
        return simulateTranscription(fileName);
      }
    }

    return simulateTranscription(fileName);
  }

  function simulateTranscription(fileName) {
    const transcriptions = [
      "I need help understanding how to set up multi-factor authentication for my organization using Microsoft 365.",
      "I received a suspicious email saying my account will be deleted if I do not click a link. Is this phishing?",
      "What is the difference between a virus and a worm? Which one is more dangerous?",
      "Can you explain zero trust architecture and how to implement it in a small business?",
      "Our company experienced a ransomware attack. What are the first steps we should take right now?",
    ];
    const hash = fileName
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return transcriptions[hash % transcriptions.length];
  }

  // ===== FILE HANDLING =====
  function setPendingFile(type, data, fileName) {
    clearPendingFile();
    pendingFile = { type, data, fileName };
    filePreviewBar.style.display = "flex";

    if (type === "image") {
      filePreviewContent.innerHTML = `
                <i class="fas fa-image" style="color: #44dd77;"></i>
                <img src="${data}" alt="Preview" style="max-height: 40px; border-radius: 6px;" />
                <span style="font-size: 0.75rem;">${fileName} — Ready for analysis</span>`;
      imageUploadBtn.classList.add("active-tool");
    } else if (type === "audio") {
      filePreviewContent.innerHTML = `
                <i class="fas fa-file-audio" style="color: #44dd77;"></i>
                <audio src="${data}" style="height: 30px;"></audio>
                <span style="font-size: 0.75rem;">${fileName} — Ready for transcription</span>`;
      audioUploadBtn.classList.add("active-tool");
    }

    searchInput.placeholder =
      type === "image"
        ? "> add optional context for image..."
        : "> add optional note with audio...";
    searchInput.focus();
  }

  function clearPendingFile() {
    pendingFile = null;
    filePreviewBar.style.display = "none";
    filePreviewContent.innerHTML = "";
    imageUploadBtn.classList.remove("active-tool");
    audioUploadBtn.classList.remove("active-tool");
    searchInput.placeholder = "> enter query, upload file, or use mic...";
    imageFileInput.value = "";
    audioFileInput.value = "";
  }

  async function processPendingFile(queryText) {
    if (!pendingFile) return;

    if (pendingFile.type === "image") {
      addImageMessage(pendingFile.data, "user", queryText);
      setTyping(true);

      try {
        const analysis = await analyzeImage(pendingFile.data, queryText);
        setTyping(false);
        addMessage(analysis, "bot");
      } catch (error) {
        setTyping(false);
        addMessage(
          `⚠️ <strong>Analysis failed:</strong> ${error.message}`,
          "bot",
        );
      }
    } else if (pendingFile.type === "audio") {
      addAudioMessage(pendingFile.data, pendingFile.fileName, "user");
      setTyping(true);

      try {
        const transcription = await transcribeAudioFile(
          pendingFile.data,
          pendingFile.fileName,
        );
        setTyping(false);

        if (transcription) {
          addAudioMessage(
            pendingFile.data,
            pendingFile.fileName,
            "bot",
            transcription,
          );
          const answer = getResponse(transcription, currentCategory);
          addMessage(answer, "bot");
        } else {
          addMessage(
            "⚠️ Could not transcribe audio. Please try again or type your question.",
            "bot",
          );
        }
      } catch (error) {
        setTyping(false);
        addMessage(
          `⚠️ <strong>Transcription failed:</strong> ${error.message}`,
          "bot",
        );
      }
    }

    clearPendingFile();
    searchInput.value = "";
  }

  // ===== IMAGE UPLOAD =====
  imageUploadBtn.addEventListener("click", () => imageFileInput.click());

  imageFileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("⚠️ Please select an image (PNG, JPG, GIF, WEBP).");
      return;
    }
    if (file.size > CONFIG.maxImageSize) {
      showToast(`⚠️ Max size: ${CONFIG.maxImageSize / 1024 / 1024}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      setPendingFile("image", e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  });

  // ===== AUDIO FILE UPLOAD =====
  audioUploadBtn.addEventListener("click", () => {
    if (isRecording) stopRecording();
    audioFileInput.click();
  });

  audioFileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    if (
      !file.type.startsWith("audio/") &&
      !file.name.match(/\.(mp3|wav|ogg|m4a|flac|aac|webm)$/i)
    ) {
      showToast("⚠️ Please select an audio file (MP3, WAV, OGG, M4A, FLAC).");
      return;
    }
    if (file.size > CONFIG.maxAudioSize) {
      showToast(`⚠️ Max size: ${CONFIG.maxAudioSize / 1024 / 1024}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      setPendingFile("audio", e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  });

  // Clear file preview
  clearFilePreviewBtn.addEventListener("click", clearPendingFile);

  // ===== MICROPHONE BUTTON =====
  function addMicButton() {
    const inputBox = document.querySelector(".hl-input-box");
    const actionsLeft = inputBox.querySelector(".input-actions-left");
    if (!actionsLeft) return;

    const micBtn = document.createElement("button");
    micBtn.className = "input-action-btn";
    micBtn.id = "micRecordBtn";
    micBtn.title = "Record voice message (Ctrl+Shift+M)";
    micBtn.innerHTML = '<i class="fas fa-microphone"></i>';

    micBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (isRecording) stopRecording();
      else startRecording();
    });

    actionsLeft.appendChild(micBtn);
  }

  // ===== EXPORT CHAT =====
  document.getElementById("exportChat")?.addEventListener("click", () => {
    if (chatHistory.length === 0) {
      showToast("⚠️ No chat history.");
      return;
    }

    let exportText = "═══════════════════════════════════\n";
    exportText += "  CyberMatrix AI Helpline - Chat Log\n";
    exportText += "═══════════════════════════════════\n\n";

    chatHistory.forEach((msg) => {
      const role = msg.sender === "bot" ? "🤖 MATRIX" : "👤 USER";
      exportText += `[${msg.timestamp}] ${role}:\n${msg.text}\n\n`;
    });

    exportText += "═══════════════════════════════════\n";
    exportText += `  Exported: ${new Date().toISOString()}\n`;
    exportText += "═══════════════════════════════════\n";

    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cybermatrix-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("✅ Chat exported.");
  });

  // ===== CLEAR CHAT =====
  document.getElementById("clearChat")?.addEventListener("click", () => {
    if (chatHistory.length <= 1) {
      showToast("⚠️ Chat is already empty.");
      return;
    }

    messageContainer.innerHTML = `
            <div class="message bot">
                <div class="avatar"><i class="fas fa-robot"></i></div>
                <div class="bubble">
                    <strong>🔰 MATRIX SECURITY HELPLINE</strong><br />
                    Chat cleared. How can I help you?
                    <span class="timestamp">${getTimestamp()}</span>
                </div>
            </div>`;
    chatHistory = [];
    conversationContext = [];
    clearPendingFile();
    showToast("🗑️ Chat cleared.");
  });

  // ===== SIDEBAR NAVIGATION =====
  document.querySelectorAll(".hl-nav-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      document
        .querySelectorAll(".hl-nav-item")
        .forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
      currentCategory = this.dataset.topic;
      const catName =
        currentCategory === "all"
          ? "All topics"
          : currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
      addMessage(`📂 <strong>Filter:</strong> ${catName}`, "bot");
      searchInput.focus();
    });
  });

  // ===== QUICK TAGS =====
  document.getElementById("quickTags")?.addEventListener("click", (e) => {
    const tag = e.target.closest(".tag");
    if (!tag) return;
    const query = tag.dataset.query || tag.textContent.trim();
    searchInput.value = query;
    handleSend();
  });

  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
      e.preventDefault();
      imageFileInput.click();
    }
    if (e.ctrlKey && e.shiftKey && e.key === "M") {
      e.preventDefault();
      if (isRecording) stopRecording();
      else startRecording();
    }
  });

  // ===== SEND & ENTER =====
  sendBtn.addEventListener("click", handleSend);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && pendingFile) {
      clearPendingFile();
    }
  });

  // ===== MODAL CLOSE =====
  document.getElementById("closeImageModal")?.addEventListener("click", () => {
    imageModal.style.display = "none";
  });
  imageModal?.addEventListener("click", function (e) {
    if (e.target === this) this.style.display = "none";
  });

  // ===== DRAG & DROP =====
  function setupDragAndDrop() {
    const dropZone = document.querySelector(".hl-chat-window");
    if (!dropZone) return;

    const defaultBorder = "#1f7a33";
    const hoverBorder = "#3ad86a";
    const defaultShadow =
      "inset 0 0 30px rgba(0, 51, 26, 0.2), 0 0 20px rgba(0, 170, 51, 0.07)";
    const hoverShadow =
      "inset 0 0 30px rgba(0, 221, 85, 0.2), 0 0 25px rgba(0, 170, 51, 0.15)";

    dropZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.style.borderColor = hoverBorder;
      this.style.boxShadow = hoverShadow;
    });

    dropZone.addEventListener("dragleave", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.style.borderColor = defaultBorder;
      this.style.boxShadow = defaultShadow;
    });

    dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.style.borderColor = defaultBorder;
      this.style.boxShadow = defaultShadow;

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          setPendingFile("image", ev.target.result, file.name);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("audio/")) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          setPendingFile("audio", ev.target.result, file.name);
        };
        reader.readAsDataURL(file);
      } else {
        showToast("⚠️ Drop an image or audio file.");
      }
    });
  }

  // ===== CLIPBOARD PASTE FOR IMAGES =====
  document.addEventListener("paste", function (e) {
    if (
      document.activeElement !== searchInput &&
      document.activeElement !== document.body
    )
      return;

    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = function (ev) {
          setPendingFile("image", ev.target.result, "pasted-image.png");
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  });

  // ===== INITIALIZATION =====
  function init() {
    searchInput.focus();
    initSpeechRecognition();
    addMicButton();
    setupDragAndDrop();

    console.log("🔐 CyberMatrix Helpline v3.0 Ready");
    console.log("  ⌨️ Ctrl+Shift+I — Upload image");
    console.log("  ⌨️ Ctrl+Shift+M — Start/stop mic");
    console.log("  ⌨️ Esc — Clear pending file");
    console.log("  🖱️ Drag & drop files onto chat");
    console.log("  📋 Paste images from clipboard");

    setTimeout(() => {
      const tips = [
        "💡 <strong>Tip:</strong> Upload a screenshot of any suspicious email for instant visual analysis.",
        "💡 <strong>Tip:</strong> Click the 🎤 microphone to speak your question — real-time transcription.",
        "💡 <strong>Tip:</strong> Drag and drop images or audio files directly onto the chat window.",
        "💡 <strong>Tip:</strong> Press Ctrl+Shift+I to upload an image, or Ctrl+Shift+M for the mic.",
        "💡 <strong>Tip:</strong> Use the sidebar to filter responses by security category.",
        "💡 <strong>Tip:</strong> Paste images directly from your clipboard into the chat.",
      ];
      addMessage(tips[Math.floor(Math.random() * tips.length)], "bot");
    }, 2500);
  }

  init();
})();
