// assets/js/tools.js
// Security tools functionality - all client-side

(function() {
    'use strict';

    // ===== TOOL TAB SWITCHING =====
    function switchTool(toolName) {
        // Update tabs
        document.querySelectorAll('.tool-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tool === toolName) tab.classList.add('active');
        });
        
        // Update panels
        document.querySelectorAll('.tool-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const targetPanel = document.getElementById(`panel-${toolName}`);
        if (targetPanel) targetPanel.classList.add('active');
    }

    // ===== COPY TO CLIPBOARD =====
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.borderColor = '#27c93f';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.borderColor = '';
            }, 2000);
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    }

    // ===== PASSWORD GENERATOR =====
    function generatePassword() {
        const length = parseInt(document.getElementById('passLength').value);
        const includeUpper = document.getElementById('includeUpper').checked;
        const includeLower = document.getElementById('includeLower').checked;
        const includeNumbers = document.getElementById('includeNumbers').checked;
        const includeSymbols = document.getElementById('includeSymbols').checked;

        const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let charPool = '';
        if (includeUpper) charPool += upperChars;
        if (includeLower) charPool += lowerChars;
        if (includeNumbers) charPool += numberChars;
        if (includeSymbols) charPool += symbolChars;

        if (!charPool) {
            document.getElementById('generatedPassword').value = 'Select at least one character type.';
            return;
        }

        let password = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += charPool[array[i] % charPool.length];
        }

        document.getElementById('generatedPassword').value = password;
        checkPasswordStrength(password, 'strengthFill', 'strengthText');
        document.getElementById('passwordStrengthBar').style.display = 'block';
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
            strength = 'Weak';
            color = '#ff4444';
            width = '25%';
        } else if (score <= 4) {
            strength = 'Fair';
            color = '#ff8c00';
            width = '50%';
        } else if (score <= 6) {
            strength = 'Strong';
            color = '#ffd700';
            width = '75%';
        } else {
            strength = 'Very Strong';
            color = '#27c93f';
            width = '100%';
        }

        fill.style.width = width;
        fill.style.background = color;
        text.textContent = `Strength: ${strength} (Score: ${score}/8)`;
        text.style.color = color;
    }

    // ===== HASH GENERATOR =====
    async function generateHash() {
        const input = document.getElementById('hashInput').value;
        const algorithm = document.getElementById('hashAlgorithm').value;
        const output = document.getElementById('hashOutput');
        const warning = document.getElementById('hashWarning');

        if (!input) {
            output.value = 'Please enter text to hash.';
            return;
        }

        // Show warning for legacy algorithms
        if (algorithm === 'MD5' || algorithm === 'SHA-1') {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }

        try {
            let hash;
            if (algorithm === 'MD5') {
                // MD5 not in Web Crypto, use alternative or show message
                output.value = 'MD5 requires a library (e.g., crypto-js). Using SHA-256 instead for demo.';
                const encoder = new TextEncoder();
                const data = encoder.encode(input);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                hash = Array.from(new Uint8Array(hashBuffer))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
                output.value = `[Demo: SHA-256] ${hash}`;
            } else {
                const encoder = new TextEncoder();
                const data = encoder.encode(input);
                const hashBuffer = await crypto.subtle.digest(algorithm, data);
                hash = Array.from(new Uint8Array(hashBuffer))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
                output.value = hash;
            }
        } catch (error) {
            output.value = `Error: ${error.message}`;
        }
    }

    // ===== BASE64 ENCODE/DECODE =====
    function encodeBase64() {
        const input = document.getElementById('b64EncodeInput').value;
        const output = document.getElementById('b64EncodeOutput');
        try {
            output.value = btoa(unescape(encodeURIComponent(input)));
        } catch {
            output.value = btoa(input);
        }
    }

    function decodeBase64() {
        const input = document.getElementById('b64DecodeInput').value;
        const output = document.getElementById('b64DecodeOutput');
        try {
            output.value = decodeURIComponent(escape(atob(input)));
        } catch {
            try {
                output.value = atob(input);
            } catch {
                output.value = 'Invalid Base64 string.';
            }
        }
    }

    // ===== URL ENCODE/DECODE =====
    function encodeURL() {
        const input = document.getElementById('urlEncodeInput').value;
        document.getElementById('urlEncodeOutput').value = encodeURIComponent(input);
    }

    function decodeURL() {
        const input = document.getElementById('urlDecodeInput').value;
        try {
            document.getElementById('urlDecodeOutput').value = decodeURIComponent(input);
        } catch {
            document.getElementById('urlDecodeOutput').value = 'Invalid URL-encoded string.';
        }
    }

    // ===== JSON FORMATTER =====
    function formatJSON() {
        const input = document.getElementById('jsonInput').value;
        const output = document.getElementById('jsonOutput');
        const status = document.getElementById('jsonStatus');
        
        try {
            const parsed = JSON.parse(input);
            output.value = JSON.stringify(parsed, null, 2);
            status.textContent = '✅ Valid JSON';
            status.style.color = '#27c93f';
        } catch (e) {
            status.textContent = `❌ Invalid JSON: ${e.message}`;
            status.style.color = '#ff4444';
        }
    }

    function minifyJSON() {
        const input = document.getElementById('jsonInput').value;
        const output = document.getElementById('jsonOutput');
        const status = document.getElementById('jsonStatus');
        
        try {
            const parsed = JSON.parse(input);
            output.value = JSON.stringify(parsed);
            status.textContent = '✅ Minified successfully';
            status.style.color = '#27c93f';
        } catch (e) {
            status.textContent = `❌ Invalid JSON: ${e.message}`;
            status.style.color = '#ff4444';
        }
    }

    function validateJSON() {
        const input = document.getElementById('jsonInput').value;
        const status = document.getElementById('jsonStatus');
        
        try {
            JSON.parse(input);
            status.textContent = '✅ Valid JSON syntax';
            status.style.color = '#27c93f';
        } catch (e) {
            status.textContent = `❌ Invalid: ${e.message}`;
            status.style.color = '#ff4444';
        }
    }

    // ===== DEMO BACKEND TOOLS =====
    function demoBackendTool(type) {
        const outputId = type === 'whois' ? 'whoisOutput' : 'ipOutput';
        const statusId = type === 'whois' ? 'whoisStatus' : 'ipStatus';
        const output = document.getElementById(outputId);
        const status = document.getElementById(statusId);
        
        output.value = `[DEMO MODE]\n\nThis feature requires a backend server to perform ${type === 'whois' ? 'WHOIS' : 'IP'} lookups.\n\nIn production, this would connect to a serverless function or API endpoint.\n\nFor now, try the client-side tools like Password Generator or Hash Generator!`;
        status.innerHTML = '<i class="fas fa-info-circle"></i> Backend not configured. Demo response shown.';
    }

    // ===== INITIALIZATION =====
    document.addEventListener('DOMContentLoaded', () => {
        // Tool tab switching
        document.getElementById('toolSelector')?.addEventListener('click', (e) => {
            const tab = e.target.closest('.tool-tab');
            if (!tab) return;
            switchTool(tab.dataset.tool);
        });

        // Password Generator
        document.getElementById('passLength')?.addEventListener('input', function() {
            document.getElementById('passLengthValue').textContent = this.value;
        });
        document.getElementById('generatePassword')?.addEventListener('click', generatePassword);
        document.getElementById('copyPassword')?.addEventListener('click', function() {
            const pass = document.getElementById('generatedPassword').value;
            if (pass && pass !== 'Select at least one character type.') {
                copyToClipboard(pass, this);
            }
        });

        // Password Checker
        document.getElementById('passwordToCheck')?.addEventListener('input', function() {
            const pass = this.value;
            if (pass) {
                document.getElementById('checkStrengthBar').style.display = 'block';
                checkPasswordStrength(pass, 'checkStrengthFill', 'checkStrengthText');
                
                // Additional details
                const details = document.getElementById('checkDetails');
                let detailText = '';
                if (pass.length < 8) detailText += '• Too short (minimum 8 characters recommended)\n';
                if (!/[A-Z]/.test(pass)) detailText += '• Add uppercase letters\n';
                if (!/[a-z]/.test(pass)) detailText += '• Add lowercase letters\n';
                if (!/[0-9]/.test(pass)) detailText += '• Add numbers\n';
                if (!/[^A-Za-z0-9]/.test(pass)) detailText += '• Add special characters\n';
                if (pass.length >= 16 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
                    detailText = '✅ Excellent password!';
                }
                details.textContent = detailText;
            } else {
                document.getElementById('checkStrengthBar').style.display = 'none';
                document.getElementById('checkStrengthText').textContent = '';
                document.getElementById('checkDetails').textContent = '';
            }
        });

        // Hash Generator
        document.getElementById('generateHash')?.addEventListener('click', generateHash);
        document.getElementById('copyHash')?.addEventListener('click', function() {
            const hash = document.getElementById('hashOutput').value;
            if (hash) copyToClipboard(hash, this);
        });

        // Base64
        document.getElementById('encodeBase64')?.addEventListener('click', encodeBase64);
        document.getElementById('decodeBase64')?.addEventListener('click', decodeBase64);
        document.getElementById('copyB64Encoded')?.addEventListener('click', function() {
            const val = document.getElementById('b64EncodeOutput').value;
            if (val) copyToClipboard(val, this);
        });
        document.getElementById('copyB64Decoded')?.addEventListener('click', function() {
            const val = document.getElementById('b64DecodeOutput').value;
            if (val) copyToClipboard(val, this);
        });

        // URL
        document.getElementById('encodeURL')?.addEventListener('click', encodeURL);
        document.getElementById('decodeURL')?.addEventListener('click', decodeURL);
        document.getElementById('copyURLEncoded')?.addEventListener('click', function() {
            const val = document.getElementById('urlEncodeOutput').value;
            if (val) copyToClipboard(val, this);
        });
        document.getElementById('copyURLDecoded')?.addEventListener('click', function() {
            const val = document.getElementById('urlDecodeOutput').value;
            if (val) copyToClipboard(val, this);
        });

        // JSON
        document.getElementById('formatJSON')?.addEventListener('click', formatJSON);
        document.getElementById('minifyJSON')?.addEventListener('click', minifyJSON);
        document.getElementById('validateJSON')?.addEventListener('click', validateJSON);
        document.getElementById('copyJSON')?.addEventListener('click', function() {
            const val = document.getElementById('jsonOutput').value;
            if (val) copyToClipboard(val, this);
        });

        // Backend tools (demo)
        document.getElementById('lookupWhois')?.addEventListener('click', () => demoBackendTool('whois'));
        document.getElementById('lookupIP')?.addEventListener('click', () => demoBackendTool('ip'));
    });
})();