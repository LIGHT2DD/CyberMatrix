// assets/js/home.js
// Homepage-specific functionality

(function() {
    'use strict';

    // Counter animation
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-count'));
            const duration = 2000; // ms
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            let step = 0;
            
            const timer = setInterval(() => {
                step++;
                current += increment;
                
                if (step >= steps) {
                    counter.textContent = target % 1 === 0 ? target.toLocaleString() : target.toFixed(1);
                    clearInterval(timer);
                } else {
                    counter.textContent = target % 1 === 0 
                        ? Math.floor(current).toLocaleString() 
                        : current.toFixed(1);
                }
            }, duration / steps);
        });
    }

    // Load latest threats
    async function loadLatestThreats() {
        const container = document.getElementById('latestThreats');
        if (!container) return;
        
        try {
            const response = await fetch('data/threats.json');
            const threats = await response.json();
            
            // Show first 4 threats
            const latest = threats.slice(0, 4);
            
            container.innerHTML = latest.map(threat => `
                <div class="card">
                    <div class="card-icon">
                        <i class="fas ${threat.icon || 'fa-skull'}"></i>
                    </div>
                    <h3 class="card-title">${threat.name}</h3>
                    <p class="card-text">${threat.description}</p>
                    <div style="margin-top: 0.8rem;">
                        <span class="badge" style="background: ${threat.severity === 'Critical' ? 'rgba(255,50,50,0.3)' : threat.severity === 'High' ? 'rgba(255,150,0,0.3)' : 'rgba(0,200,100,0.3)'};">
                            <i class="fas fa-exclamation-triangle"></i> ${threat.severity}
                        </span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.warn('Failed to load threats:', error);
            container.innerHTML = `
                <div class="card">
                    <div class="card-icon"><i class="fas fa-skull"></i></div>
                    <h3 class="card-title">Threat Data Unavailable</h3>
                    <p class="card-text">Unable to load threat data. Please try again later or visit the threats page.</p>
                    <a href="threats.html" class="btn-matrix btn-matrix-outline" style="margin-top: 0.8rem; display: inline-flex;">View Threats</a>
                </div>`;
        }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // Delay counter animation slightly for effect
        setTimeout(animateCounters, 500);
        loadLatestThreats();
    });
})();