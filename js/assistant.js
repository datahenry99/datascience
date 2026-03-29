// ===== DataHenry AI 助手 =====
(function () {
  'use strict';

  /* ---------- 数据 ---------- */
  let allTools = [];
  let allPapers = [];
  let allArticles = [];
  let toolCategories = [];
  let paperSections = [];
  let articleSections = [];
  let dataReady = false;

  const isSubPage = window.location.pathname.includes('/pages/');
  const prefix = isSubPage ? '../' : '';

  async function loadData() {
    if (dataReady) return;
    try {
      const ver = '20260329';
      const [tRes, pRes, aRes] = await Promise.all([
        fetch(prefix + 'data/tools.json?v=' + ver),
        fetch(prefix + 'data/papers.json?v=' + ver),
        fetch(prefix + 'data/articles.json?v=' + ver)
      ]);
      if (!tRes.ok || !pRes.ok || !aRes.ok) throw new Error('HTTP error');
      const tData = await tRes.json();
      const pData = await pRes.json();
      const aData = await aRes.json();

      toolCategories = tData.categories || [];
      allTools = (tData.tools || []).map(t => {
        const cat = toolCategories.find(c => c.id === t.category);
        return { ...t, catTitle: cat ? cat.title : '', catEmoji: cat ? cat.emoji : '' };
      });

      paperSections = pData.sections || [];
      allPapers = [];
      paperSections.forEach(sec => {
        (sec.papers || []).forEach(p => {
          allPapers.push({ ...p, section: sec.title, sectionIcon: sec.icon, sectionId: sec.id });
        });
      });

      articleSections = aData.sections || [];
      allArticles = [];
      articleSections.forEach(sec => {
        (sec.items || []).forEach(item => {
          allArticles.push({ ...item, section: sec.title, sectionIcon: sec.icon, sectionId: sec.id });
        });
      });

      dataReady = true;
    } catch (e) {
      console.error('AI 助手数据加载失败', e);
    }
  }

  /* ---------- 意图识别 ---------- */
  // 关键词 -> 分类/领域映射
  const intentMap = {
    // 工具分类
    '数据处理': ['数据处理', 'data-processing', 'pandas', 'numpy', 'polars', 'dask', 'spark', 'etl', '清洗', '数据清洗'],
    '机器学习': ['机器学习', 'ml', 'sklearn', 'scikit', 'xgboost', 'lightgbm', '分类', '回归', '聚类', '随机森林', 'svm'],
    '深度学习': ['深度学习', 'dl', 'pytorch', 'tensorflow', 'keras', '神经网络', 'cnn', 'rnn', 'transformer', '训练'],
    '可视化': ['可视化', 'viz', 'matplotlib', 'plotly', 'seaborn', 'echarts', '图表', '仪表板', 'dashboard'],
    'NLP': ['nlp', '自然语言', '文本', 'huggingface', 'spacy', 'nltk', 'bert', 'gpt', '语言模型', '分词', '情感分析', 'langchain'],
    '计算机视觉': ['cv', '计算机视觉', '图像', '视觉', 'opencv', 'yolo', '目标检测', '图像分类', '图像生成'],
    '部署': ['部署', 'deploy', 'mlops', 'docker', 'mlflow', 'serving', '上线', '工程化', '实验追踪'],
    'AutoML': ['automl', '自动', 'notebook', 'jupyter', 'kaggle', 'colab', '实验'],
    'AI Agent': ['agent', '智能体', '自动化', 'langchain', 'autogen', '龙虾'],
    // 通用意图
    '入门': ['入门', '初学', '新手', '开始', '学习', '推荐', '从哪', '怎么学', '路线'],
    '论文': ['论文', 'paper', '经典', '里程碑', '研究', '学术'],
    '博客': ['博客', 'blog', '公众号', '社区', '资讯', '订阅', '阅读'],
    '全部工具': ['所有工具', '全部工具', '工具列表', '有哪些工具', '工具推荐'],
  };

  function detectIntent(query) {
    const q = query.toLowerCase();
    const matched = [];
    for (const [intent, keywords] of Object.entries(intentMap)) {
      for (const kw of keywords) {
        if (q.includes(kw.toLowerCase())) {
          matched.push(intent);
          break;
        }
      }
    }
    return matched;
  }

  /* ---------- 推荐引擎 ---------- */
  function generateReply(query) {
    if (!dataReady) return { text: '数据加载中，请稍等片刻…', cards: [] };

    const q = query.toLowerCase().trim();
    if (!q) return { text: '请输入你想了解的内容 😊', cards: [] };

    const intents = detectIntent(q);

    // 入门推荐
    if (intents.includes('入门')) {
      const beginnerTools = allTools.filter(t =>
        ['Pandas', 'Scikit-learn', 'Matplotlib', 'Jupyter Notebook', 'NumPy'].includes(t.name)
      );
      const beginnerPapers = allPapers.slice(0, 3);
      return {
        text: '🎓 **新手入门推荐路线**\n\n建议按以下顺序学习：\n1. **Python 基础** → NumPy + Pandas 数据处理\n2. **可视化** → Matplotlib 画图理解数据\n3. **机器学习** → Scikit-learn 入门经典算法\n4. **进阶** → 阅读经典论文，尝试深度学习框架\n\n以下是推荐的入门工具：',
        cards: beginnerTools.map(t => formatToolCard(t)),
        extra: beginnerPapers.length ? '\n📄 **推荐先读这几篇经典论文：**' : '',
        extraCards: beginnerPapers.map(p => formatPaperCard(p))
      };
    }

    // 论文查询
    if (intents.includes('论文') && intents.length === 1) {
      // 通用论文推荐
      const topPapers = allPapers.filter(p => {
        const impact = p.impact || '';
        const num = parseInt(impact.replace(/[^\d]/g, ''));
        return num >= 10000;
      }).slice(0, 6);
      return {
        text: '📄 **必读论文推荐**\n\n本站收录了 ' + allPapers.length + ' 篇经典论文，覆盖 ' + paperSections.length + ' 大方向。以下是引用量最高的几篇：',
        cards: topPapers.map(p => formatPaperCard(p))
      };
    }

    // 博客查询
    if (intents.includes('博客') && !intents.some(i => !['博客'].includes(i))) {
      const topBlogs = allArticles.slice(0, 6);
      return {
        text: '📚 **博客社区推荐**\n\n本站收录了 ' + allArticles.length + ' 个优质来源，覆盖 ' + articleSections.length + ' 大板块。以下是精选推荐：',
        cards: topBlogs.map(a => formatArticleCard(a))
      };
    }

    // 全部工具
    if (intents.includes('全部工具')) {
      const summary = toolCategories.map(c => c.emoji + ' **' + c.title + '**（' + allTools.filter(t => t.category === c.id).length + ' 个）').join('\n');
      return {
        text: '🛠️ **工具榜单概览**\n\n共收录 ' + allTools.length + ' 款工具，分为 ' + toolCategories.length + ' 大类：\n\n' + summary + '\n\n你可以问我具体分类，如"NLP 工具有哪些？"',
        cards: []
      };
    }

    // 分类匹配 → 推荐该分类工具
    const catIntents = intents.filter(i => !['入门', '论文', '博客', '全部工具'].includes(i));
    if (catIntents.length > 0) {
      let matchedTools = [];
      let matchedPapers = [];
      let catLabel = catIntents.join(' / ');

      for (const intent of catIntents) {
        // 工具
        const catMapping = {
          '数据处理': 'data-processing', '机器学习': 'ml', '深度学习': 'dl',
          '可视化': 'viz', 'NLP': 'nlp', '计算机视觉': 'cv',
          '部署': 'deploy', 'AutoML': 'auto', 'AI Agent': 'agent'
        };
        const catId = catMapping[intent];
        if (catId) {
          matchedTools = matchedTools.concat(allTools.filter(t => t.category === catId));
        }
        // 论文 — 关键词匹配
        matchedPapers = matchedPapers.concat(
          allPapers.filter(p =>
            (p.abstract && p.abstract.toLowerCase().includes(q)) ||
            p.title.toLowerCase().includes(q) ||
            (p.section && p.section.includes(intent))
          )
        );
      }

      // 去重
      matchedTools = [...new Map(matchedTools.map(t => [t.name, t])).values()];
      matchedPapers = [...new Map(matchedPapers.map(p => [p.title, p])).values()].slice(0, 4);

      if (matchedTools.length > 0) {
        let text = '🔍 为你找到 **' + catLabel + '** 相关的 ' + matchedTools.length + ' 款工具：';
        const result = { text, cards: matchedTools.slice(0, 8).map(t => formatToolCard(t)) };
        if (matchedPapers.length > 0) {
          result.extra = '\n📄 **相关论文：**';
          result.extraCards = matchedPapers.map(p => formatPaperCard(p));
        }
        if (matchedTools.length > 8) {
          result.text += '\n\n_（仅展示前 8 个，更多请访问_ [工具榜单](' + prefix + 'pages/tools.html) _）_';
        }
        return result;
      }
    }

    // 通用关键词搜索
    const toolResults = allTools.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.tag.toLowerCase().includes(q) ||
      t.catTitle.toLowerCase().includes(q)
    ).slice(0, 6);

    const paperResults = allPapers.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.abstract && p.abstract.toLowerCase().includes(q)) ||
      p.section.toLowerCase().includes(q)
    ).slice(0, 4);

    const articleResults = allArticles.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.desc && a.desc.toLowerCase().includes(q)) ||
      a.section.toLowerCase().includes(q)
    ).slice(0, 4);

    const total = toolResults.length + paperResults.length + articleResults.length;
    if (total === 0) {
      return {
        text: '🤔 没有找到与 **"' + query + '"** 直接相关的内容。\n\n你可以试试：\n- 换个关键词，如"机器学习"、"可视化"\n- 问我"有哪些工具"查看全部\n- 或者问"入门推荐"获取学习路线',
        cards: []
      };
    }

    let text = '🔍 为你找到 ' + total + ' 个相关结果：';
    const cards = [];
    const extra = [];

    if (toolResults.length > 0) {
      text += '\n\n🛠️ **工具（' + toolResults.length + '）**';
      toolResults.forEach(t => cards.push(formatToolCard(t)));
    }
    if (paperResults.length > 0) {
      extra.push('\n📄 **论文（' + paperResults.length + '）**');
      paperResults.forEach(p => cards.push(formatPaperCard(p)));
    }
    if (articleResults.length > 0) {
      extra.push('\n📚 **博客（' + articleResults.length + '）**');
      articleResults.forEach(a => cards.push(formatArticleCard(a)));
    }

    return { text: text + extra.join(''), cards };
  }

  /* ---------- 卡片格式化 ---------- */
  function formatToolCard(t) {
    return {
      type: 'tool',
      emoji: t.catEmoji || '🛠️',
      title: t.name,
      desc: t.desc.length > 80 ? t.desc.slice(0, 80) + '…' : t.desc,
      tag: t.tag,
      badge: t.badge || '',
      stars: t.stars || '',
      url: t.url,
      icon: t.icon
    };
  }

  function formatPaperCard(p) {
    return {
      type: 'paper',
      emoji: p.sectionIcon || '📄',
      title: p.title,
      desc: p.abstract ? (p.abstract.length > 80 ? p.abstract.slice(0, 80) + '…' : p.abstract) : '',
      tag: p.section,
      badge: p.impact || '',
      stars: p.year ? '📅 ' + p.year : '',
      url: p.url
    };
  }

  function formatArticleCard(a) {
    return {
      type: 'article',
      emoji: a.sectionIcon || '📚',
      title: a.name,
      desc: a.desc ? (a.desc.length > 80 ? a.desc.slice(0, 80) + '…' : a.desc) : '',
      tag: a.section,
      badge: '',
      stars: a.source || '',
      url: a.url
    };
  }

  /* ---------- 简易 Markdown ---------- */
  function miniMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_\((.+?)\)_/g, '<em style="opacity:.7">($1)</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="ai-inline-link">$1</a>')
      .replace(/\n/g, '<br>');
  }

  /* ---------- UI 渲染 ---------- */
  let chatHistory = [];

  const quickQuestions = [
    { emoji: '🎓', text: '入门推荐' },
    { emoji: '🛠️', text: '有哪些工具' },
    { emoji: '📄', text: '经典论文推荐' },
    { emoji: '📚', text: '博客社区推荐' },
    { emoji: '🐼', text: '数据处理工具' },
    { emoji: '🧠', text: '深度学习框架' },
    { emoji: '💬', text: 'NLP 工具' },
    { emoji: '📊', text: '可视化工具' },
  ];

  function injectAssistantUI() {
    // 浮动按钮 — 小羊形象
    const fab = document.createElement('button');
    fab.className = 'ai-fab';
    fab.id = 'aiFab';
    fab.textContent = '🐑';
    fab.title = '小羊助手';
    fab.addEventListener('click', toggleAssistant);
    document.body.appendChild(fab);

    // 滚动自动隐藏（面板未打开时）
    let scrollTimer = null;
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', function () {
      const panel = document.getElementById('aiPanel');
      if (panel && panel.classList.contains('active')) return; // 面板打开时不隐藏
      fab.classList.add('fab-hidden');
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        fab.classList.remove('fab-hidden');
      }, 800);
      lastScrollY = window.scrollY;
    }, { passive: true });

    // 对话面板
    const panel = document.createElement('div');
    panel.className = 'ai-panel';
    panel.id = 'aiPanel';
    panel.innerHTML = `
      <div class="ai-panel-header">
        <div class="ai-panel-title">
          <span class="ai-panel-logo">🐑</span>
          <span>小羊助手</span>
        </div>
        <button class="ai-panel-close" id="aiPanelClose">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="ai-chat-body" id="aiChatBody"></div>
      <div class="ai-input-area">
        <input type="text" id="aiInput" class="ai-input" placeholder="问我任何数据科学相关的问题…" autocomplete="off">
        <button class="ai-send-btn" id="aiSendBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    `;
    document.body.appendChild(panel);

    // 事件
    document.getElementById('aiPanelClose').addEventListener('click', toggleAssistant);
    document.getElementById('aiSendBtn').addEventListener('click', handleSend);
    document.getElementById('aiInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.isComposing) handleSend();
    });

    // 初始消息
    showWelcome();
  }

  function showWelcome() {
    const body = document.getElementById('aiChatBody');
    body.innerHTML = '';
    chatHistory = [];

    // 欢迎消息
    appendBotMessage('👋 你好！我是 **小羊助手**，可以帮你：\n\n- 🛠️ 推荐数据科学工具\n- 📄 查找经典论文\n- 📚 发现优质博客\n- 🎓 规划学习路线\n\n试试下面的快捷问题，或直接输入你想了解的内容：');

    // 快捷问题
    const quickWrap = document.createElement('div');
    quickWrap.className = 'ai-quick-questions';
    quickQuestions.forEach(qq => {
      const btn = document.createElement('button');
      btn.className = 'ai-quick-btn';
      btn.textContent = qq.emoji + ' ' + qq.text;
      btn.addEventListener('click', function () {
        document.getElementById('aiInput').value = qq.text;
        handleSend();
      });
      quickWrap.appendChild(btn);
    });
    body.appendChild(quickWrap);
  }

  function toggleAssistant() {
    const panel = document.getElementById('aiPanel');
    const fab = document.getElementById('aiFab');
    const isOpen = panel.classList.toggle('active');
    fab.classList.toggle('active', isOpen);
    // 移动端面板打开时隐藏按钮
    if (window.innerWidth <= 768) {
      fab.style.display = isOpen ? 'none' : '';
    }
    if (isOpen) {
      loadData();
      document.getElementById('aiInput').focus();
    }
  }

  async function handleSend() {
    const input = document.getElementById('aiInput');
    const query = input.value.trim();
    if (!query) return;
    input.value = '';

    // 用户消息
    appendUserMessage(query);

    // 加载数据
    await loadData();

    // typing 动画
    const typingEl = appendTyping();

    // 模拟短暂延迟（更自然）
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

    typingEl.remove();

    // 生成回复
    const reply = generateReply(query);

    // 渲染回复
    appendBotMessage(reply.text);
    if (reply.cards && reply.cards.length > 0) {
      appendCards(reply.cards);
    }
    if (reply.extra) {
      appendBotMessage(reply.extra);
    }
    if (reply.extraCards && reply.extraCards.length > 0) {
      appendCards(reply.extraCards);
    }

    scrollToBottom();
  }

  function appendUserMessage(text) {
    const body = document.getElementById('aiChatBody');
    const msg = document.createElement('div');
    msg.className = 'ai-msg ai-msg-user';
    msg.innerHTML = '<div class="ai-msg-bubble ai-msg-user-bubble">' + escapeHtml(text) + '</div>';
    body.appendChild(msg);
    chatHistory.push({ role: 'user', text });
    scrollToBottom();
  }

  function appendBotMessage(text) {
    const body = document.getElementById('aiChatBody');
    const msg = document.createElement('div');
    msg.className = 'ai-msg ai-msg-bot';
    msg.innerHTML = '<div class="ai-msg-avatar">🐑</div><div class="ai-msg-bubble ai-msg-bot-bubble">' + miniMarkdown(text) + '</div>';
    body.appendChild(msg);
    chatHistory.push({ role: 'bot', text });
    scrollToBottom();
  }

  function appendCards(cards) {
    const body = document.getElementById('aiChatBody');
    const wrap = document.createElement('div');
    wrap.className = 'ai-cards-wrap';
    cards.forEach(c => {
      const card = document.createElement('a');
      card.className = 'ai-rec-card';
      card.href = c.url;
      card.target = '_blank';
      card.rel = 'noopener';

      const typeClass = c.type === 'tool' ? 'ai-type-tool' : c.type === 'paper' ? 'ai-type-paper' : 'ai-type-article';
      const iconHtml = c.icon
        ? '<img src="' + c.icon + '" class="ai-card-icon" onerror="this.style.display=\'none\'" alt="">'
        : '<span class="ai-card-emoji">' + c.emoji + '</span>';

      card.innerHTML =
        '<div class="ai-card-head">' +
          iconHtml +
          '<div class="ai-card-meta">' +
            '<span class="ai-card-title">' + escapeHtml(c.title) + '</span>' +
            '<span class="ai-card-tag ' + typeClass + '">' + escapeHtml(c.tag) + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="ai-card-desc">' + escapeHtml(c.desc) + '</p>' +
        (c.badge || c.stars ? '<div class="ai-card-foot">' +
          (c.stars ? '<span class="ai-card-stars">' + c.stars + '</span>' : '') +
          (c.badge ? '<span class="ai-card-badge">' + c.badge + '</span>' : '') +
        '</div>' : '');

      wrap.appendChild(card);
    });
    body.appendChild(wrap);
    scrollToBottom();
  }

  function appendTyping() {
    const body = document.getElementById('aiChatBody');
    const msg = document.createElement('div');
    msg.className = 'ai-msg ai-msg-bot';
    msg.innerHTML = '<div class="ai-msg-avatar">🐑</div><div class="ai-msg-bubble ai-msg-bot-bubble ai-typing"><span></span><span></span><span></span></div>';
    body.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function scrollToBottom() {
    const body = document.getElementById('aiChatBody');
    requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- 初始化 ---------- */
  window.addEventListener('DOMContentLoaded', injectAssistantUI);
})();
