// ===== DataHenry 全站搜索 =====
(function () {
  let searchIndex = [];
  let searchLoaded = false;

  // 注入搜索弹窗 HTML
  function injectSearchModal() {
    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'searchOverlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === this) closeSearch();
    });

    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.id = 'searchModal';
    modal.innerHTML = `
      <div class="search-input-wrap">
        <svg class="search-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="searchInput" class="search-input" placeholder="搜索本站信息" autocomplete="off">
        <kbd class="search-kbd" id="searchKbd">ESC</kbd>
      </div>
      <div class="search-results" id="searchResults">
        <div class="search-empty" id="searchEmpty">
          <p>🔍 输入关键词开始搜索</p>
          <p class="search-empty-hint">支持搜索本站工具、论文、博客社区</p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    document.getElementById('searchKbd').addEventListener('click', closeSearch);
    document.getElementById('searchInput').addEventListener('input', function (e) {
      doSearch(e.target.value);
    });
  }

  // 加载搜索索引
  async function loadSearchIndex() {
    if (searchLoaded) return;
    try {
      const isSubPage = window.location.pathname.includes('/pages/');
      const prefix = isSubPage ? '../' : '';
      const ver = '20260402';

      const [toolsRes, papersRes, articlesRes] = await Promise.all([
        fetch(prefix + 'data/tools.json?v=' + ver),
        fetch(prefix + 'data/papers.json?v=' + ver),
        fetch(prefix + 'data/articles.json?v=' + ver)
      ]);
      if (!toolsRes.ok || !papersRes.ok || !articlesRes.ok) throw new Error('HTTP error');
      const toolsData = await toolsRes.json();
      const papers = await papersRes.json();
      const articles = await articlesRes.json();

      const toolsPage = isSubPage ? 'tools.html' : 'pages/tools.html';
      const papersPage = isSubPage ? 'papers.html' : 'pages/papers.html';
      const articlesPage = isSubPage ? 'articles.html' : 'pages/articles.html';

      (toolsData.tools || toolsData).forEach(function (t) {
        searchIndex.push({
          type: '🛠 工具',
          title: t.name,
          desc: t.desc,
          tag: t.tag,
          url: t.url,
          page: toolsPage
        });
      });

      papers.sections.forEach(function (sec) {
        sec.papers.forEach(function (p) {
          searchIndex.push({
            type: '📄 论文',
            title: p.title,
            desc: p.abstract || '',
            tag: sec.title,
            url: p.url,
            page: papersPage + '#' + sec.id
          });
        });
      });

      articles.sections.forEach(function (sec) {
        sec.items.forEach(function (item) {
          searchIndex.push({
            type: '📚 博客',
            title: item.name,
            desc: item.desc || '',
            tag: sec.title,
            url: item.url,
            page: articlesPage + '#' + sec.id
          });
        });
      });

      const flashcardsRes = await fetch(prefix + 'data/flashcards.json?v=' + ver);
      if (!flashcardsRes.ok) throw new Error('HTTP ' + flashcardsRes.status);
      const flashcardsData = await flashcardsRes.json();
      const flashcardsPage = isSubPage ? 'flashcards.html' : 'pages/flashcards.html';

      flashcardsData.topics.forEach(function (topic) {
        topic.cards.forEach(function (card) {
          searchIndex.push({
            type: '🧠 知识卡片',
            title: card.question,
            desc: card.answer.slice(0, 100),
            tag: topic.title + ' · ' + card.category,
            url: flashcardsPage,
            page: flashcardsPage
          });
        });
      });

      searchLoaded = true;
    } catch (e) {
      console.error('搜索索引加载失败', e);
    }
  }

  function openSearch() {
    document.getElementById('searchOverlay').classList.add('active');
    document.getElementById('searchModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    var input = document.getElementById('searchInput');
    input.value = '';
    input.focus();
    resetResults();
    loadSearchIndex();
  }

  function closeSearch() {
    document.getElementById('searchOverlay').classList.remove('active');
    document.getElementById('searchModal').classList.remove('active');
    document.body.style.overflow = '';
  }

  function resetResults() {
    var results = document.getElementById('searchResults');
    results.innerHTML = '<div class="search-empty" id="searchEmpty"><p>🔍 输入关键词开始搜索</p><p class="search-empty-hint">支持搜索工具、论文、博客社区、知识卡片，按 ⌘K 快速唤起</p></div>';
  }

  function doSearch(query) {
    var results = document.getElementById('searchResults');
    if (!query.trim()) {
      resetResults();
      return;
    }

    var q = query.toLowerCase();
    var matched = searchIndex.filter(function (item) {
      return item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q);
    }).slice(0, 20);

    results.innerHTML = '';
    if (matched.length === 0) {
      results.innerHTML = '<div class="search-empty"><p>😅 没有找到相关结果</p><p class="search-empty-hint">换个关键词试试？</p></div>';
      return;
    }

    matched.forEach(function (item) {
      var a = document.createElement('a');
      a.className = 'search-result-item';
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener';

      var descText = item.desc.length > 60 ? item.desc.slice(0, 60) + '...' : item.desc;
      a.innerHTML =
        '<div class="search-result-header">' +
        '<span class="search-result-type">' + escapeHtml(item.type) + '</span>' +
        '<span class="search-result-tag">' + escapeHtml(item.tag) + '</span>' +
        '</div>' +
        '<h4 class="search-result-title">' + highlightMatch(item.title, q) + '</h4>' +
        '<p class="search-result-desc">' + highlightMatch(descText, q) + '</p>';
      results.appendChild(a);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    var escaped = escapeHtml(text);
    var escapedQuery = escapeHtml(query);
    var regex = new RegExp('(' + escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // 暴露到全局
  window.openSearch = openSearch;
  window.closeSearch = closeSearch;

  // DOM Ready
  document.addEventListener('DOMContentLoaded', function () {
    injectSearchModal();

    // 绑定导航搜索按钮
    var searchBtn = document.querySelector('.nav-search');
    if (searchBtn) {
      searchBtn.addEventListener('click', openSearch);
    }

    // 快捷键
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') closeSearch();
    });
  });
})();
