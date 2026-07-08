// assets/js/navbar.js
// Loads navbar and footer components into pages

(function() {
    'use strict';

    // Load HTML component into target element
    async function loadComponent(url, targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${url}`);
            const html = await response.text();
            target.innerHTML = html;
            
            // Re-initialize any scripts within the component
            initializeComponent(targetId);
        } catch (error) {
            console.warn(`Component load failed for ${url}:`, error);
            // Fallback: render minimal version
            if (targetId === 'navbar-container') {
                target.innerHTML = `
                    <nav style="padding: 1rem; background: rgba(6,15,6,0.95); border-bottom: 1px solid #1f7a33; text-align: center;">
                        <a href="index.html" style="color: #aaffaa; text-decoration: none; font-size: 1.2rem;">
                            <i class="fas fa-shield-halved"></i> CyberMatrix
                        </a>
                    </nav>`;
            }
        }
    }

    function initializeComponent(targetId) {
        if (targetId === 'navbar-container') {
            // Nav toggle functionality
            const toggle = document.getElementById('navToggle');
            const links = document.getElementById('navLinks');
            if (toggle && links) {
                toggle.addEventListener('click', () => links.classList.toggle('open'));
            }
            
            // Set active link
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                }
            });
        }
    }

    // Load components on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        loadComponent('components/navbar.html', 'navbar-container');
        loadComponent('components/footer.html', 'footer-container');
    });
})();