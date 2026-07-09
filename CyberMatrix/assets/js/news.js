// assets/js/news.js

(function() {
    'use strict';

    const NEWS_API_URL = 'https://hn.algolia.com/api/v1/search_by_date?query=cybersecurity&tags=story&hitsPerPage=30';
    const LOCAL_NEWS_URL = 'data/news.json';

    let allNews = [];
    let currentFilter = 'all';
    let currentSearch = '';
    let filterTimer;

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
            allNews = await fetchNewsFromApi();
            filterNews();
        } catch (error) {
            console.warn('Failed to load news:', error);
            try {
                allNews = await fetchLocalNews();
                filterNews();
            } catch (fallbackError) {
                console.warn('Failed to load fallback news:', fallbackError);
                list.innerHTML = `
                    <div class="card" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff7777; margin-bottom: 1rem; display: block;"></i>
                        <h3>Unable to Load News</h3>
                        <p style="color: #88dd99;">Please try again later.</p>
                    </div>`;
            }
        }
    }

    async function fetchNewsFromApi() {
        const response = await fetch(NEWS_API_URL);
        if (!response.ok) throw new Error('Failed to fetch API news');

        const data = await response.json();
        return (data.hits || [])
            .filter(item => item.title && item.url)
            .map(mapApiNewsItem);
    }

    async function fetchLocalNews() {
        const response = await fetch(LOCAL_NEWS_URL);
        if (!response.ok) throw new Error('Failed to fetch local news');

        return response.json();
    }

    function mapApiNewsItem(item) {
        return {
            id: item.objectID,
            title: item.title,
            excerpt: item.story_text || item.comment_text || 'Latest cybersecurity story from the public security news feed.',
            category: getNewsCategory(`${item.title} ${item.url}`),
            source: getSourceName(item.url),
            date: item.created_at?.slice(0, 10) || 'Recent',
            url: item.url,
        };
    }

    function getNewsCategory(text) {
        const normalized = text.toLowerCase();

        if (normalized.includes('cve') || normalized.includes('critical') || normalized.includes('vulnerability')) return 'alert';
        if (normalized.includes('ransomware') || normalized.includes('malware') || normalized.includes('phishing')) return 'threat';
        if (normalized.includes('breach') || normalized.includes('leak') || normalized.includes('attack')) return 'incident';
        if (normalized.includes('patch') || normalized.includes('update') || normalized.includes('release')) return 'update';

        return 'trend';
    }

    function getSourceName(url) {
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch (error) {
            return 'Security Feed';
        }
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        })[character]);
    }

    function renderNews(news) {
        const list = document.getElementById('newsList');
        const noNews = document.getElementById('noNews');

        if (!list) return;

        if (news.length === 0) {
            list.innerHTML = '';
            if (noNews) noNews.style.display = 'block';
            return;
        }

        if (noNews) noNews.style.display = 'none';

        list.innerHTML = news.map(item => `
            <div class="news-item" data-url="${escapeHtml(item.url || '')}">
                <div class="news-category-icon ${item.category}">
                    <i class="fas ${categoryIcons[item.category] || 'fa-newspaper'}"></i>
                </div>
                <div class="news-content">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.excerpt)}</p>
                    <div class="news-meta">
                        <span><i class="fas fa-building"></i> ${escapeHtml(item.source)}</span>
                        <span><i class="fas fa-calendar"></i> ${escapeHtml(item.date)}</span>
                    </div>
                </div>
                <span class="news-badge ${item.category}">${escapeHtml(item.category)}</span>
            </div>
        `).join('');
    }

    function getSearchText(item) {
        return [
            item.title,
            item.excerpt,
            item.category,
            item.source,
            item.date,
        ].join(' ').toLowerCase();
    }

    function updateActiveFilter() {
        document.querySelectorAll('#newsFilters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === currentFilter) btn.classList.add('active');
        });
    }

    function filterNews() {
        updateActiveFilter();

        let filtered = allNews;

        if (currentFilter !== 'all') {
            filtered = filtered.filter(n => n.category === currentFilter);
        }

        if (currentSearch) {
            const search = currentSearch.toLowerCase();
            filtered = filtered.filter(n => getSearchText(n).includes(search));
        }

        renderNews(filtered);
    }

    function queueFilterNews() {
        const list = document.getElementById('newsList');
        window.clearTimeout(filterTimer);
        list?.classList.add('is-filtering');

        filterTimer = window.setTimeout(() => {
            filterNews();
            requestAnimationFrame(() => list?.classList.remove('is-filtering'));
        }, 120);
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadNews();

        document.getElementById('newsSearch')?.addEventListener('input', function() {
            currentSearch = this.value.trim();
            queueFilterNews();
        });

        document.getElementById('newsFilters')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            currentFilter = btn.dataset.filter;
            queueFilterNews();
        });

        document.getElementById('newsList')?.addEventListener('click', (e) => {
            const item = e.target.closest('.news-item');
            if (!item?.dataset.url || item.dataset.url === '#') return;

            window.open(item.dataset.url, '_blank', 'noopener');
        });
    });
})();
