// assets/js/articles.js

(function() {
    'use strict';

    let allArticles = [];
    let currentCategory = 'all';
    let currentSearch = '';

    async function loadArticles() {
        const grid = document.getElementById('articlesGrid');
        if (!grid) return;

        try {
            const response = await fetch('data/articles.json');
            if (!response.ok) throw new Error('Failed to fetch');
            allArticles = await response.json();
            renderArticles(allArticles);
        } catch (error) {
            console.warn('Failed to load articles:', error);
            grid.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff7777; margin-bottom: 1rem; display: block;"></i>
                    <h3>Unable to Load Articles</h3>
                    <p style="color: #88dd99;">Please try again later.</p>
                </div>`;
        }
    }

    function renderArticles(articles) {
        const grid = document.getElementById('articlesGrid');
        const noResults = document.getElementById('noArticles');
        
        if (!grid) return;

        if (articles.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        grid.innerHTML = articles.map(article => `
            <div class="article-card">
                <span class="article-category">${article.category.replace('-', ' ')}</span>
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="article-tag">#${tag}</span>`).join('')}
                </div>
                <div class="article-meta">
                    <span><i class="fas fa-user"></i> ${article.author}</span>
                    <span><i class="fas fa-calendar"></i> ${article.date}</span>
                    <span><i class="fas fa-clock"></i> ${article.readTime}</span>
                </div>
            </div>
        `).join('');
    }

    function filterArticles() {
        let filtered = allArticles;

        if (currentCategory !== 'all') {
            filtered = filtered.filter(a => a.category === currentCategory);
        }

        if (currentSearch) {
            const search = currentSearch.toLowerCase();
            filtered = filtered.filter(a => 
                a.title.toLowerCase().includes(search) ||
                a.excerpt.toLowerCase().includes(search) ||
                a.tags.some(tag => tag.includes(search))
            );
        }

        renderArticles(filtered);
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadArticles();

        // Search
        document.getElementById('articleSearch')?.addEventListener('input', function() {
            currentSearch = this.value.trim();
            filterArticles();
        });

        // Category filters
        document.getElementById('categoryFilters')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            
            document.querySelectorAll('#categoryFilters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            filterArticles();
        });
    });
})();