// assets/js/quiz.js

(function () {
  "use strict";

  const questions = [
    ["Suspicious Login Email", "An email says your account will be locked in 10 minutes unless you click a link. What should you do first?", ["Open the link quickly", "Go to the official site yourself", "Reply and ask if it is real"], 1, "Use a trusted route and check the account directly."],
    ["Unknown Attachment", "A coworker sends an unexpected invoice attachment. What is safest?", ["Open it because it came from a coworker", "Verify through another channel first", "Forward it to everyone"], 1, "Accounts can be compromised. Verify unexpected files out-of-band."],
    ["Password Reuse", "One reused password appears in a breach. What matters most?", ["Change only the breached site", "Change every reused password and enable MFA", "Wait for login alerts"], 1, "Every account using that password is at risk."],
    ["MFA Fatigue", "Your phone gets repeated MFA prompts you did not request. What should you do?", ["Approve one to stop prompts", "Deny them and change your password", "Ignore them"], 1, "Repeated MFA prompts often mean someone has your password."],
    ["Public Wi-Fi", "You need to access a work portal from cafe Wi-Fi. What is safest?", ["Use the work VPN first", "Use any strong Wi-Fi signal", "Disable HTTPS warnings"], 0, "A VPN helps protect traffic on untrusted networks."],
    ["Found USB Drive", "You find a USB drive in a hallway. What should you do?", ["Plug it in to find the owner", "Hand it to IT or lost-and-found", "Open it on a friend's laptop"], 1, "Unknown removable media should be treated as untrusted."],
    ["Fake Update Pop-Up", "A random website offers a browser update installer. What should you do?", ["Download it", "Update from official browser settings", "Install then scan later"], 1, "Fake update pop-ups commonly deliver malware."],
    ["Ransomware Sign", "Which sign most strongly suggests ransomware activity?", ["Many files suddenly have strange extensions", "A browser asks to save a password", "One page loads slowly"], 0, "Mass file changes are a major ransomware indicator."],
    ["Least Privilege", "A teammate asks for permanent admin access just in case. What is best?", ["Give permanent admin access", "Grant only needed access when needed", "Share your admin password"], 1, "Least privilege limits damage from mistakes and compromises."],
    ["Sensitive File Sharing", "You need to send personal data to another team. What is safest?", ["Use approved secure sharing with access controls", "Upload to any free file site", "Rename the file"], 0, "Sensitive data needs controlled access and approved tools."],
    ["Fake Login Page", "A login page looks normal, but the URL is misspelled. What should you do?", ["Log in because it looks real", "Leave and navigate to the official domain", "Enter a wrong password to test"], 1, "Misspelled domains are common credential traps."],
    ["Backups", "What backup approach best helps after ransomware?", ["Backup on the same computer", "Offline or immutable backups tested regularly", "Screenshots of files"], 1, "Backups must survive the attack and be restorable."],
    ["Social Engineering Call", "Someone claiming to be IT asks for your MFA code. What should you do?", ["Give it if they know your name", "Refuse and contact IT officially", "Ask them to promise"], 1, "MFA codes should never be shared."],
    ["Certificate Warning", "A work site shows a certificate warning. What is safest?", ["Proceed if busy", "Stop and verify with IT", "Refresh until it disappears"], 1, "Do not bypass security warnings casually."],
    ["Cloud Permissions", "Which cloud folder permission is safest?", ["Anyone with link can edit", "Specific people with minimum permission", "Public access"], 1, "Limit access and permissions deliberately."],
    ["Patch Management", "A patch fixes an actively exploited vulnerability. What should happen?", ["Prioritize testing and deployment", "Wait for yearly maintenance", "Ignore if system seems fine"], 0, "Active exploitation raises patch urgency."],
    ["Clicked a Bad Link", "You clicked a suspicious link and realized it may be phishing. What next?", ["Hide it", "Report immediately and follow guidance", "Click again to confirm"], 1, "Quick reporting can prevent wider compromise."],
    ["Unlocked Device", "You step away from a shared office computer. What is best?", ["Lock the screen", "Leave it open briefly", "Turn off only the monitor"], 0, "Screen locking prevents casual unauthorized access."],
    ["API Key Exposure", "You accidentally pushed an API key to a public repo. First priority?", ["Delete the commit only", "Revoke/rotate the key and review logs", "Rename the variable"], 1, "Treat exposed secrets as compromised."],
    ["Unofficial Download", "You downloaded a tool from an unofficial mirror. What before running it?", ["Verify official source and integrity", "Run it and uninstall if suspicious", "Trust the filename"], 0, "Source and integrity checks reduce supply-chain risk."],
    ["DDoS Symptom", "Which situation best matches a possible DDoS attack?", ["Massive traffic from many sources makes a service unavailable", "One user forgets a password", "One email is delayed"], 0, "DDoS overwhelms availability with distributed traffic."],
    ["Login Logs", "Which login event deserves investigation?", ["Normal city during work hours", "Many failures then success from a new country", "A password change you requested"], 1, "That pattern can indicate credential compromise."],
    ["Data Classification", "Why classify data as public, internal, confidential, or restricted?", ["To guide handling and protection", "To make names look professional", "To avoid access controls"], 0, "Classification guides security controls."],
    ["Zero Trust", "Which statement best reflects Zero Trust?", ["Trust everyone on office network", "Verify explicitly and grant least privilege", "Remove every password"], 1, "Zero Trust avoids implicit trust and limits access."],
    ["Lost Phone", "Your phone with work email is lost. What should you do first?", ["Wait a day", "Report it and trigger remote lock/wipe if available", "Change the wallpaper"], 1, "Fast reporting protects accounts and data."],
  ].map(([title, prompt, choices, correctIndex, explanation]) => ({
    title,
    prompt,
    options: choices.map((text, index) => ({
      text,
      correct: index === correctIndex,
    })),
    explanation,
  }));

  let currentQuestion = 0;
  let score = 0;
  const answeredQuestions = new Set();

  function getCorrectAnswer(question) {
    return question.options.find((option) => option.correct)?.text || "";
  }

  function updateStatus() {
    const progress = document.getElementById("quizProgress");
    const scoreElement = document.getElementById("quizScore");

    if (progress) {
      progress.textContent = `Question ${currentQuestion + 1}/${questions.length}`;
    }
    if (scoreElement) {
      scoreElement.textContent = `Score ${score}/${answeredQuestions.size}`;
    }
    localStorage.setItem(
      "cm_quiz_score",
      JSON.stringify({
        score,
        answered: answeredQuestions.size,
        total: questions.length,
      }),
    );
  }

  function renderQuestion() {
    const question = questions[currentQuestion];
    const title = document.getElementById("quizQuestion");
    const prompt = document.getElementById("quizPrompt");
    const options = document.getElementById("quizOptions");
    const feedback = document.getElementById("quizFeedback");

    if (!title || !prompt || !options || !feedback) return;

    title.textContent = question.title;
    prompt.textContent = question.prompt;
    feedback.textContent = "";
    options.innerHTML = question.options
      .map(
        (option, index) => `
          <button class="quiz-option" type="button" data-option="${index}">
            <i class="fas fa-chevron-right"></i>
            <span>${option.text}</span>
          </button>
        `,
      )
      .join("");
    updateStatus();
  }

  function initializeQuiz() {
    const options = document.getElementById("quizOptions");
    const feedback = document.getElementById("quizFeedback");
    const next = document.getElementById("nextQuestion");
    if (!options || !feedback || !next) return;

    renderQuestion();

    options.addEventListener("click", (event) => {
      const button = event.target.closest(".quiz-option");
      if (!button) return;

      const question = questions[currentQuestion];
      const selected = question.options[Number(button.dataset.option)];
      options.querySelectorAll(".quiz-option").forEach((optionButton) => {
        optionButton.classList.remove("correct", "incorrect");
        optionButton.querySelector("i").className = "fas fa-chevron-right";
      });

      if (!answeredQuestions.has(currentQuestion) && selected.correct) {
        score++;
      }
      answeredQuestions.add(currentQuestion);

      button.classList.add(selected.correct ? "correct" : "incorrect");
      button.querySelector("i").className = selected.correct
        ? "fas fa-check-circle"
        : "fas fa-times-circle";
      feedback.textContent = selected.correct
        ? `Correct. ${question.explanation}`
        : `Wrong. Correct answer: ${getCorrectAnswer(question)}. ${question.explanation}`;
      updateStatus();
    });

    next.addEventListener("click", () => {
      currentQuestion = (currentQuestion + 1) % questions.length;
      renderQuestion();
    });
  }

  document.addEventListener("DOMContentLoaded", initializeQuiz);
})();
