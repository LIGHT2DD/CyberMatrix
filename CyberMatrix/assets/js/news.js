// assets/js/news.js

(function() {
    'use strict';

    let allNews = [];
    let currentFilter = 'all';

    const categoryIcons = {
        alert: 'fa-exclamation-triangle',
        threat: 'fa-skull',
        incident: 'fa-fire',
        update: 'fa-sync-alt',
        trend: 'fa-chart-line'
    };

    async function loadNews() {
        const list = document.getElementById('newsList');
        if (!list) return;

        try {
            const response = await fetch('data/news.json');
            if (!response.ok) throw new Error('Failed to fetch');
            allNews = await response.json();
            renderNews(allNews);
        } catch (error) {
            console.warn('Failed to load news:', error);
            list.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff7777; margin-bottom: 1rem; display: block;"></i>
                    <h3>Unable to Load News</h3>
                    <p style="color: #88dd99;">Please try again later.</p>
                </div>`;
        }
    }

    function renderNews(news) {
        const list = document.getElementById('newsList');
        const noNews = document.getElementById('noNews');

        if (!list) return;

        if (news.length === 0) {
            list.innerHTML = '';
            noNews.style.display = 'block';
            return;
        }

        noNews.style.display = 'none';

        list.innerHTML = news.map(item => `
            <div class="news-item">
                <div class="news-category-icon ${item.category}">
                    <i class="fas ${categoryIcons[item.category] || 'fa-newspaper'}"></i>
                </div>
                <div class="news-content">
                    <h3>${item.title}</h3>
                    <p>${item.excerpt}</p>
                    <div class="news-meta">
                        <span><i class="fas fa-building"></i> ${item.source}</span>
                        <span><i class="fas fa-calendar"></i> ${item.date}</span>
                    </div>
                </div>
                <span class="news-badge ${item.category}">${item.category}</span>
            </div>
        `).join('');
    }

    function filterNews(category) {
        currentFilter = category;

        document.querySelectorAll('#newsFilters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === category) btn.classList.add('active');
        });

        if (category === 'all') {
            renderNews(allNews);
        } else {
            const filtered = allNews.filter(n => n.category === category);
            renderNews(filtered);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadNews();

        document.getElementById('newsFilters')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            filterNews(btn.dataset.filter);
        });
    });
})();