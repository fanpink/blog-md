// 获取DOM元素
const navTabs = document.getElementById('navTabs');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');

// 当前选中的标签
let currentTab = 'home';

// 从服务器获取文件树结构
async function fetchFileTree() {
  const response = await fetch('/config/tree.json');
  return await response.json();
}

// 从服务器获取文章内容
async function fetchArticle(path) {
  const response = await fetch(`/contents/${path}`);
  return await response.text();
}

// 渲染导航标签
async function renderNavTabs() {
  const tree = await fetchFileTree();
  
  // 清空现有标签
  navTabs.innerHTML = '';
  
  // 添加首页标签
  const homeTab = document.createElement('div');
  homeTab.className = `nav-tab ${currentTab === 'home' ? 'active' : ''}`;
  homeTab.textContent = '首页';
  homeTab.dataset.tab = 'home';
  homeTab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    homeTab.classList.add('active');
    currentTab = 'home';
    renderSidebar();
  });
  navTabs.appendChild(homeTab);
  
  // 添加分类标签
  tree.children.forEach(child => {
    if (child.type === 'directory') {
      const tab = document.createElement('div');
      tab.className = `nav-tab ${currentTab === child.name ? 'active' : ''}`;
      tab.textContent = child.name;
      tab.dataset.tab = child.name;
      tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
        tab.classList.add('active');
        currentTab = child.name;
        renderSidebar();
      });
      navTabs.appendChild(tab);
    }
  });
}

// 渲染侧边栏导航
async function renderSidebar() {
  const tree = await fetchFileTree();
  sidebar.innerHTML = '';
  
  const renderItems = (items, parentPath = '') => {
    items.forEach(item => {
      if (item.type === 'file') {
        const link = document.createElement('div');
        link.className = 'article-link';
        link.textContent = item.name.replace('.md', '');
        link.addEventListener('click', () => {
          document.querySelectorAll('.article-link').forEach(el => el.classList.remove('active'));
          link.classList.add('active');
          renderArticle(parentPath + item.path);
        });
        sidebar.appendChild(link);
      } else if (item.type === 'directory') {
        // 添加分类标题
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = item.name;
        sidebar.appendChild(categoryTitle);
        
        // 递归处理子目录
        renderItems(item.children, parentPath + item.name + '/');
      }
    });
  };

  if (currentTab === 'home') {
    // 只显示.md文件
    const filesOnly = tree.children.filter(item => item.type === 'file');
    renderItems(filesOnly);
  } else {
    // 显示当前分类下的文章
    const category = tree.children.find(c => c.name === currentTab);
    if (category) {
      category.children.forEach(file => {
        if (file.type === 'file') {
          const link = document.createElement('div');
          link.className = 'article-link';
          link.textContent = file.name.replace('.md', '');
          link.addEventListener('click', () => {
            document.querySelectorAll('.article-link').forEach(el => el.classList.remove('active'));
            link.classList.add('active');
            renderArticle(file.path);
          });
          sidebar.appendChild(link);
        }
      });
    }
  }
}

// 渲染文章内容
async function renderArticle(path) {
  const content = await fetchArticle(path);

  // 配置marked保留mermaid代码块
  marked.setOptions({
    langPrefix: 'language-',
    highlight: function(code, lang) {
      // 让Prism跳过mermaid代码块
      if (lang === 'mermaid') {
        return code;
      }
      return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup, lang);
    }
  });

  // 解析Markdown
  let html = marked.parse(content);

  // 替换mermaid代码块为<div class="mermaid">
  html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (match, p1) => {
    // 解码HTML实体
    const code = p1.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return `<div class="mermaid">${code}</div>`;
  });

  // 渲染到页面
  mainContent.innerHTML = html;

  // 手动初始化mermaid
  if (window.mermaid) {
    try {
      mermaid.init({
        startOnLoad: false,
        theme: 'default'
      }, document.querySelectorAll('.mermaid'));
    } catch (e) {
      console.error('Mermaid初始化失败:', e);
    }
  }
  
  // 生成目录导航
  const tocSidebar = document.getElementById('tocSidebar');
  tocSidebar.innerHTML = '';
  
  // 提取h2-h4标题
  const headings = mainContent.querySelectorAll('h2, h3, h4');
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.substring(1));
    const item = document.createElement('div');
    item.className = 'toc-item';
    item.style.paddingLeft = `${(level - 2) * 15}px`;
    item.textContent = heading.textContent;
    
    // 点击目录项滚动到对应标题
    item.addEventListener('click', () => {
      document.querySelectorAll('.toc-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    // 监听滚动事件高亮当前目录项
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.toc-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(heading);
    tocSidebar.appendChild(item);
  });
  
  // 在Markdown渲染完成后初始化Prism
  Prism.highlightAll();
  // 渲染数学公式
  renderMathInElement(mainContent, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false},
      {left: '\\(', right: '\\)', display: false},
      {left: '\\[', right: '\\]', display: true}
    ],
    throwOnError: false
  });
}

// 初始化WebSocket连接
const socket = new WebSocket(`ws://${window.location.host}`);

// 监听WebSocket消息
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'filetree-update') {
    // 文件树有更新，重新渲染界面
    renderNavTabs();
    if (currentTab === 'home') {
      renderSidebar();
    }
  }
});

// 初始化
renderNavTabs();
renderSidebar();