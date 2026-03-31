<div align="center">

# 📊 DataHenry — 数据科学百宝箱

**工具 · 论文 · 博客，一站式数据科学学习导航平台**

[![Website](https://img.shields.io/badge/🌐_Website-datahenry.com-7c3aed?style=for-the-badge)](https://www.datahenry.com)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222?style=for-the-badge&logo=github)](https://github.com/datahenry99/datascience)
[![小红书](https://img.shields.io/badge/小红书-DataHenry-ff2442?style=for-the-badge)](https://xhslink.com/m/5PayTgjUO7K)

</div>

---

## ✨ 项目简介

DataHenry 是一个面向中文用户的**数据科学一站式学习导航平台**，精选优质工具、必读论文、博客社区和知识卡片，帮助每一位数据人系统化掌握核心技能。

- 🃏 **知识卡片** — 翻转卡片式学习，涵盖 A/B 实验、因果推断、大语言模型
- 📑 **论文精读** — 6 大方向的数据科学必读论文精选
- 🛠️ **工具榜单** — 60+ 款精选工具，覆盖数据科学全流程
- 🌐 **博客社区** — 精选公众号、技术博客与社区论坛
- 📊 **统计模拟** — 交互式动画直观理解核心统计概念（正态分布、中心极限定理、P 值等）

## 📸 功能预览

| 首页 | 知识卡片 | 论文精读 |
|:---:|:---:|:---:|
| Hero 区域 + 探索入口 | 翻转卡片交互 | 分方向论文导航 |

| 工具榜单 | 博客社区 | 关于 |
|:---:|:---:|:---:|
| 分类筛选 + 卡片展示 | 多板块内容精选 | 作者介绍与愿景 |

## 🏗️ 项目结构

```
datascience/
├── index.html              # 首页
├── 404.html                # 自定义 404 页面
├── CNAME                   # 自定义域名 (datahenry.com)
├── sitemap.xml             # SEO 站点地图
├── robots.txt              # 爬虫规则
├── pages/
│   ├── flashcards.html     # 知识卡片
│   ├── papers.html         # 论文精读
│   ├── tools.html          # 工具榜单
│   ├── articles.html       # 博客社区
│   ├── stat-intuition.html # 统计模拟
│   └── about.html          # 关于
├── data/
│   ├── flashcards.json     # 知识卡片数据 (107+ 张卡片)
│   ├── papers.json         # 论文数据 (6 大方向)
│   ├── tools.json          # 工具数据 (60+ 款工具, 9 大分类)
│   └── articles.json       # 博客社区数据 (5 大板块)
├── css/
│   ├── style.css           # 全站基础样式
│   ├── dark-mode.css       # 深色模式
│   ├── assistant.css       # AI 助手样式
│   ├── flashcards.css      # 知识卡片页面样式
│   ├── papers.css          # 论文精读页面样式
│   ├── tools.css           # 工具榜单页面样式
│   ├── articles.css        # 博客社区页面样式
│   └── about.css           # 关于页面样式
├── js/
│   ├── theme.js            # 深色/浅色模式切换
│   ├── search.js           # 全站搜索
│   ├── assistant.js        # AI 助手交互
│   └── stat-intuition.js   # 统计模拟交互逻辑
└── images/
    ├── henry-avatar.jpg    # 作者头像
    ├── og-cover.png        # 社交分享封面
    └── xiaohongshu-app.png # 小红书图标
```

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **前端** | 原生 HTML + CSS + JavaScript（零框架依赖） |
| **数据驱动** | JSON 数据文件 + `fetch()` API 动态渲染 |
| **主题** | 浅色/深色模式自动切换 |
| **字体** | Google Fonts（Noto Sans SC + Inter） |
| **图标** | 内联 SVG（无外部图标库） |
| **SEO** | Open Graph / Twitter Card / Sitemap / Canonical URL |
| **部署** | GitHub Pages + 自定义域名 |
| **响应式** | 完整移动端适配（汉堡菜单、移动端搜索、浮动目录） |

## 📊 内容板块

### 🃏 知识卡片

翻转卡片式学习模块，3 大主题共 107+ 张卡片：

| 主题 | 数量 | 描述 |
|------|------|------|
| 🧪 A/B 实验 | 40 张 | 从假设检验到实验设计的核心知识 |
| 🔍 因果推断 | — | 因果推理方法论 |
| 🤖 大语言模型 | — | 大模型知识体系 |

### 📑 论文精读

系统梳理 6 大方向的必读论文：

- 📐 **概率统计** — 经典统计与贝叶斯推理
- 📈 **机器学习** — 核心算法与模型
- 🧪 **AB 实验** — 在线实验方法论
- 🔗 **因果推断** — 因果推理框架
- ⏱ **时序预测** — 时间序列分析
- 🤖 **人工智能** — 前沿 AI 论文

### 🛠️ 工具榜单

60+ 款精选工具，9 大分类：

`🐼 数据处理` `📈 机器学习` `🧠 深度学习` `📊 数据可视化` `💬 自然语言处理` `👁 计算机视觉` `🚀 部署与工程` `🔧 AutoML 与实验工具` `🤖 AI Agent`

### 🌐 博客社区

精选 5 大板块优质内容来源：

`🤖 AI 社区` `📊 数据科学` `🏢 大厂博客` `✍️ 个人博客` `📱 优质公众号`

### 📊 统计模拟

交互式动画模拟，直观理解核心统计概念：

| 模块 | 描述 |
|------|------|
| 📐 正态分布 | 实时调整均值和标准差，观察分布变化 |
| 📊 中心极限定理 | 可视化样本均值的分布收敛过程 |
| 🎯 P 值 | 动态演示假设检验与 P 值含义 |
| 📏 置信区间 | 直观理解置信区间的覆盖率 |
| 🔔 贝叶斯定理 | 交互式贝叶斯更新过程 |
| 🎲 大数定律 | 观察样本均值趋向总体均值 |
| ⚠️ Type I/II 错误 | 理解两类错误的权衡 |
| 🔀 辛普森悖论 | 数据聚合的反直觉现象 |
| 🔗 马尔可夫链 | 状态转移与稳态分布 |

## 🚀 本地运行

项目为纯静态网站，无需安装任何依赖：

```bash
# 克隆仓库
git clone https://github.com/datahenry99/datascience.git
cd datascience

# 方式一：使用 Python 启动本地服务器
python3 -m http.server 8080

# 方式二：使用 Node.js
npx serve .

# 方式三：直接用 VS Code 的 Live Server 插件打开 index.html
```

然后访问 `http://localhost:8080` 即可。

## 🎨 特色功能

- 🌙 **深色模式** — 一键切换浅色/深色主题，自动记忆偏好
- 🔍 **全站搜索** — 快速检索论文、工具、博客和知识卡片
- 🐑 **AI 助手** — 内置智能助手，辅助学习
- 📊 **统计模拟** — 9 大交互式动画模块，直观理解统计概念
- 📱 **移动端适配** — 汉堡菜单 + 浮动目录 + 底部滑出面板
- ⬆ **返回顶部** — 滚动后自动出现
- 🦴 **骨架屏** — 数据加载时优雅的骨架屏过渡
- 🔗 **SEO 优化** — 完整的 Open Graph 和 Twitter Card 支持

## 🤝 贡献与反馈

欢迎每一位数据科学爱好者参与建设！

- 📝 **提交 Issue** — [推荐资源、报告问题或提出建议](https://github.com/datahenry99/datascience/issues)
- 🌟 **Star** — 如果觉得有帮助，给个 ⭐ 支持一下
- 📱 **小红书** — 关注 [DataHenry](https://xhslink.com/m/5PayTgjUO7K) 获取更多数据科学干货

## 📅 更新日志

| 日期 | 更新 |
|------|------|
| 2026.03.31 | 📊 统计模拟上线：9 大交互式动画模块，支持深色模式与移动端适配 |
| 2026.03.29 | ✨ 体验优化升级：返回顶部按钮、骨架屏、自定义 404、搜索 Bug 修复 |
| 2026.03.27 | 🧠 知识卡片上线：3 大主题 107+ 张翻转卡片 |
| 2026.03.24 | 📚 内容板块完善：论文精读、工具榜单、博客社区上线 |
| 2026.03 | 🚀 DataHenry 正式上线 |

## 📄 License

© 2026 DataHenry. All Rights Reserved.

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！**

Made with ❤️ by [DataHenry](https://www.datahenry.com)

</div>
