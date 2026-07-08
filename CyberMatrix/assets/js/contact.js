// assets/js/contact.js

(function() {
    'use strict';

    // Handle contact form submission (demo)
    window.handleContactSubmit = function(event) {
        event.preventDefault();
        
        const form = document.getElementById('contactForm');
        const success = document.getElementById('contactSuccess');
        
        // Demo: just show success
        form.style.display = 'none';
        success.style.display = 'block';
        
        // Reset after 5 seconds
        setTimeout(() => {
            form.style.display = 'block';
            success.style.display = 'none';
            form.reset();
        }, 5000);
    };

    // Load FAQ for contact page
    async function loadContactFaq() {
        const container = document.getElementById('contactFaq');
        if (!container) return;

        try {
            const response = await fetch('data/faq.json');
            const faqs = await response.json();
            
            // Show first 3 FAQs
            const miniFaqs = faqs.slice(0, 3);
            
            container.innerHTML = miniFaqs.map((faq, index) => `
                <div class="faq-mini-item" data-index="${index}">
                    <div class="faq-mini-q">
                        ${faq.question}
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-mini-a">${faq.answer}</div>
                </div>
            `).join('');

            // Toggle FAQ items
            container.addEventListener('click', (e) => {
                const item = e.target.closest('.faq-mini-item');
                if (!item) return;
                item.classList.toggle('open');
            });
        } catch (error) {
            console.warn('Failed to load FAQs:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', loadContactFaq);
})();