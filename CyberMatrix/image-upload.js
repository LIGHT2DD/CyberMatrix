/**
 * ================================================================
 * CYBERMATRIX - Image Upload Module
 * ================================================================
 * Features:
 *   - Drag & drop file upload
 *   - Image preview
 *   - File validation
 *   - Simulated upload with progress
 *   - Recent uploads history (stored in localStorage)
 *   - Delete uploaded images
 * ================================================================
 */

(function() {
    'use strict';

    // ===== DOM REFERENCES =====
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const imagePreview = document.getElementById('imagePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileDimensions = document.getElementById('fileDimensions');
    const removeBtn = document.getElementById('removeBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    const statusMessage = document.getElementById('statusMessage');
    const progressFill = document.getElementById('progressFill');
    const uploadsList = document.getElementById('uploadsList');

    // ===== STATE =====
    let currentFile = null;
    let uploadHistory = [];

    // ===== CONSTANTS =====
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    const STORAGE_KEY = 'cybermatrix_uploads';

    // ===== INIT =====
    function init() {
        loadHistory();
        renderHistory();
        setupEventListeners();
    }

    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // File input change
        fileInput.addEventListener('change', handleFileSelect);

        // Drag and drop events
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);

        // Button events
        removeBtn.addEventListener('click', handleRemove);
        uploadBtn.addEventListener('click', handleUpload);

        // Click on drop zone triggers file input
        dropZone.addEventListener('click', () => fileInput.click());
    }

    // ===== FILE HANDLING =====
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    }

    function handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }

    function processFile(file) {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            showStatus('error', 'Invalid file type. Please upload an image (JPG, PNG, GIF, SVG, WebP).');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            showStatus('error', `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
            return;
        }

        currentFile = file;
        showPreview(file);
        hideStatus();
    }

    // ===== PREVIEW =====
    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            
            // Get image dimensions
            const img = new Image();
            img.onload = function() {
                fileDimensions.textContent = `${img.width}×${img.height}`;
            };
            img.src = e.target.result;

            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            previewSection.classList.add('visible');
        };
        reader.readAsDataURL(file);
    }

    function handleRemove() {
        currentFile = null;
        previewSection.classList.remove('visible');
        imagePreview.src = '';
        fileInput.value = '';
        hideStatus();
    }

    // ===== UPLOAD =====
    function handleUpload() {
        if (!currentFile) {
            showStatus('error', 'No file selected. Please choose an image to upload.');
            return;
        }

        // Simulate upload with progress
        simulateUpload(currentFile);
    }

    function simulateUpload(file) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        
        showStatus('info', 'Uploading...');
        progressFill.style.width = '0%';

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                completeUpload(file);
            }
            progressFill.style.width = progress + '%';
        }, 300);
    }

    function completeUpload(file) {
        // Create upload record
        const record = {
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            timestamp: new Date().toISOString(),
            status: 'success'
        };

        // Add to history
        uploadHistory.unshift(record);
        saveHistory();
        renderHistory();

        // Show success
        showStatus('success', `✅ "${file.name}" uploaded successfully!`);
        uploadBtn.innerHTML = '<i class="fas fa-check"></i> Uploaded';
        
        // Reset after delay
        setTimeout(() => {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload';
            handleRemove();
        }, 2000);
    }

    // ===== STATUS =====
    function showStatus(type, message) {
        uploadStatus.className = 'upload-status visible';
        uploadStatus.classList.add(type);
        statusMessage.innerHTML = message;
        
        if (type === 'error') {
            statusMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        } else if (type === 'success') {
            statusMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        } else {
            statusMessage.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
        }
    }

    function hideStatus() {
        uploadStatus.className = 'upload-status';
        progressFill.style.width = '0%';
    }

    // ===== HISTORY (localStorage) =====
    function loadHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            uploadHistory = data ? JSON.parse(data) : [];
        } catch (e) {
            uploadHistory = [];
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadHistory));
        } catch (e) {
            console.error('Failed to save upload history:', e);
        }
    }

    function renderHistory() {
        if (uploadHistory.length === 0) {
            uploadsList.innerHTML = '<p class="empty-msg">No images uploaded yet</p>';
            return;
        }

        let html = '';
        uploadHistory.forEach((item, index) => {
            const date = new Date(item.timestamp);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString();
            
            html += `
                <div class="upload-item">
                    <div class="info">
                        <div class="name">${escapeHtml(item.name)}</div>
                        <div class="meta">${formatFileSize(item.size)} · ${dateStr} ${timeStr}</div>
                    </div>
                    <span class="status-badge ${item.status}">${item.status}</span>
                    <button class="delete-btn" data-id="${item.id}" title="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        uploadsList.innerHTML = html;

        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteHistoryItem(id);
            });
        });
    }

    function deleteHistoryItem(id) {
        uploadHistory = uploadHistory.filter(item => item.id !== id);
        saveHistory();
        renderHistory();
    }

    // ===== UTILITY FUNCTIONS =====
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== START =====
    document.addEventListener('DOMContentLoaded', init);

})();