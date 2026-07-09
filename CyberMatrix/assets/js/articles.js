// assets/js/articles.js

(function() {
    'use strict';

    const ARTICLE_API_URL = 'https://dev.to/api/articles?tag=cybersecurity&per_page=30';
    const LOCAL_ARTICLES_URL = 'data/articles.json';

    let allArticles = [];
    let currentCategory = 'all';
    let currentSearch = '';
    let filterTimer;

    async function loadArticles() {
        const grid = document.getElementById('articlesGrid');
        if (!grid) return;

        try {
            allArticles = await fetchArticlesFromApi();
            filterArticles();
        } catch (error) {
            console.warn('Failed to load articles:', error);
            try {
                allArticles = await fetchLocalArticles();
                filterArticles();
            } catch (fallbackError) {
                console.warn('Failed to load fallback articles:', fallbackError);
                grid.innerHTML = `
                    <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff7777; margin-bottom: 1rem; display: block;"></i>
                        <h3>Unable to Load Articles</h3>
                        <p style="color: #88dd99;">Please try again later.</p>
                    </div>`;
            }
        }
    }

    async function fetchArticlesFromApi() {
        const response = await fetch(ARTICLE_API_URL);
        if (!response.ok) throw new Error('Failed to fetch API articles');

        const articles = await response.json();
        return articles.map(mapApiArticle);
    }

    async function fetchLocalArticles() {
        const response = await fetch(LOCAL_ARTICLES_URL);
        if (!response.ok) throw new Error('Failed to fetch local articles');

        return response.json();
    }

    function mapApiArticle(article) {
        const tags = article.tag_list || [];

        return {
            id: article.id,
            title: article.title,
            excerpt: article.description || 'Read the full article for details and practical security guidance.',
            category: getArticleCategory(tags),
            author: article.user?.name || 'CyberMatrix Feed',
            date: article.readable_publish_date || article.published_at?.slice(0, 10) || 'Recent',
            readTime: `${article.reading_time_minutes || 5} min read`,
            tags: tags.slice(0, 4),
            url: article.url,
        };
    }

    function getArticleCategory(tags) {
        const normalizedTags = tags.map(tag => tag.toLowerCase());

        if (normalizedTags.some(tag => ['phishing', 'malware', 'ransomware', 'threats', 'hacking'].includes(tag))) {
            return 'threats';
        }
        if (normalizedTags.some(tag => ['incidentresponse', 'incident-response', 'forensics', 'soc'].includes(tag))) {
            return 'incident-response';
        }
        if (normalizedTags.some(tag => ['cloud', 'aws', 'azure', 'gcp', 'devops'].includes(tag))) {
            return 'cloud';
        }
        if (normalizedTags.some(tag => ['identity', 'authentication', 'mfa', 'oauth'].includes(tag))) {
            return 'identity';
        }

        return 'defense';
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

    function renderArticles(articles) {
        const grid = document.getElementById('articlesGrid');
        const noResults = document.getElementById('noArticles');
        
        if (!grid) return;

        if (articles.length === 0) {
            grid.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        grid.innerHTML = articles.map(article => `
            <div class="article-card" data-url="${escapeHtml(article.url || '')}">
                <span class="article-category">${escapeHtml(article.category.replace('-', ' '))}</span>
                <h3>${escapeHtml(article.title)}</h3>
                <p>${escapeHtml(article.excerpt)}</p>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="article-tag">#${escapeHtml(tag)}</span>`).join('')}
                </div>
                <div class="article-meta">
                    <span><i class="fas fa-user"></i> ${escapeHtml(article.author)}</span>
                    <span><i class="fas fa-calendar"></i> ${escapeHtml(article.date)}</span>
                    <span><i class="fas fa-clock"></i> ${escapeHtml(article.readTime)}</span>
                </div>
            </div>
        `).join('');
    }

    function getSearchText(article) {
        return [
            article.title,
            article.excerpt,
            article.category,
            article.author,
            article.date,
            article.readTime,
            ...(article.tags || []),
        ].join(' ').toLowerCase();
    }

    function filterArticles() {
        let filtered = allArticles;

        if (currentCategory !== 'all') {
            filtered = filtered.filter(a => a.category === currentCategory);
        }

        if (currentSearch) {
            const search = currentSearch.toLowerCase();
            filtered = filtered.filter(a => getSearchText(a).includes(search));
        }

        renderArticles(filtered);
    }

    function queueFilterArticles() {
        const grid = document.getElementById('articlesGrid');
        window.clearTimeout(filterTimer);
        grid?.classList.add('is-filtering');

        filterTimer = window.setTimeout(() => {
            filterArticles();
            requestAnimationFrame(() => grid?.classList.remove('is-filtering'));
        }, 120);
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadArticles();

        // Search
        document.getElementById('articleSearch')?.addEventListener('input', function() {
            currentSearch = this.value.trim();
            queueFilterArticles();
        });

        // Category filters
        document.getElementById('categoryFilters')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            
            document.querySelectorAll('#categoryFilters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            queueFilterArticles();
        });

        document.getElementById('articlesGrid')?.addEventListener('click', (e) => {
            const card = e.target.closest('.article-card');
            if (!card?.dataset.url) return;

            window.open(card.dataset.url, '_blank', 'noopener');
        });
    });
})();
