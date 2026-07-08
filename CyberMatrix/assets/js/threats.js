// assets/js/threats.js
// Threat Intelligence page functionality

(function() {
    'use strict';

    let allThreats = [];
    let currentFilter = 'all';

    // Fetch threat data
    async function loadThreats() {
        const grid = document.getElementById('threatsGrid');
        if (!grid) return;

        try {
            const response = await fetch('data/threats.json');
            if (!response.ok) throw new Error('Failed to fetch');
            allThreats = await response.json();
            renderThreats(allThreats);
        } catch (error) {
            console.warn('Failed to load threats:', error);
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

    function renderThreats(threats) {
        const grid = document.getElementById('threatsGrid');
        const noResults = document.getElementById('noResults');
        
        if (!grid) return;

        if (threats.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        grid.innerHTML = threats.map(threat => `
            <div class="threat-card severity-${threat.severity.toLowerCase()}" 
                 data-id="${threat.id}"
                 onclick="window._openThreatModal(${threat.id})">
                <div class="threat-card-header">
                    <div class="threat-card-icon">
                        <i class="fas ${threat.icon || 'fa-skull'}"></i>
                    </div>
                    <div class="threat-card-info">
                        <span class="category-label">${threat.category.replace('-', ' ')}</span>
                        <h3>${threat.name}</h3>
                    </div>
                </div>
                <div class="threat-card-body">
                    ${threat.description}
                </div>
                <div class="threat-card-footer">
                    <span class="severity-badge ${threat.severity.toLowerCase()}">
                        <i class="fas fa-exclamation-triangle"></i> ${threat.severity}
                    </span>
                    <span style="font-size: 0.65rem; color: #66aa77;">
                        Click for details <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
            </div>
        `).join('');
    }

    // Filter threats
    function filterThreats(category) {
        currentFilter = category;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === category) {
                btn.classList.add('active');
            }
        });

        if (category === 'all') {
            renderThreats(allThreats);
        } else {
            const filtered = allThreats.filter(t => t.category === category);
            renderThreats(filtered);
        }
    }

    // Modal functionality
    window._openThreatModal = function(threatId) {
        const threat = allThreats.find(t => t.id === threatId);
        if (!threat) return;

        const modal = document.getElementById('threatModal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = `
            <div class="modal-detail">
                <div class="modal-detail-icon">
                    <i class="fas ${threat.icon || 'fa-skull'}"></i>
                </div>
                <span class="severity-badge ${threat.severity.toLowerCase()}" style="margin-bottom: 1rem; display: inline-block;">
                    <i class="fas fa-exclamation-triangle"></i> ${threat.severity}
                </span>
                <h3>${threat.name}</h3>
                <p style="color: #88dd99; margin-bottom: 1.5rem; line-height: 1.8;">${threat.description}</p>
                
                <h4 style="font-size: 0.85rem; color: #66dd88; margin-bottom: 0.8rem;">
                    <i class="fas fa-search"></i> Indicators of Compromise
                </h4>
                <ul class="indicators-list" style="margin-bottom: 1.5rem; padding-left: 1.2rem;">
                    ${threat.indicators.map(i => `<li>${i}</li>`).join('')}
                </ul>
                
                <h4 style="font-size: 0.85rem; color: #66dd88; margin-bottom: 0.8rem;">
                    <i class="fas fa-shield"></i> Mitigation
                </h4>
                <p class="mitigation-text">${threat.mitigation}</p>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    function closeModal() {
        const modal = document.getElementById('threatModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        loadThreats();

        // Filter button clicks
        document.getElementById('threatFilters')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            filterThreats(btn.dataset.filter);
        });

        // Modal close
        document.getElementById('closeModal')?.addEventListener('click', closeModal);
        document.getElementById('threatModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    });
})();