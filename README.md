# blog-md-trae-cn

本项目是一个基于 Node.js + Express 的 Markdown 博客内容管理服务。  
主要功能为：  
- 提供 `public`、`config`、`contents` 目录的静态文件访问
- 自动监听 `contents` 目录下的 Markdown 文件变动，生成内容树（`config/tree.json`）

## 依赖

- Node.js 16 及以上
- npm

## 安装依赖

```bash
npm install
```

## 运行项目

```bash
node server.js
```

或使用 `npm start`（如已在 `package.json` 配置）

## 访问方式

- 服务端口：**5609**
- 访问地址：http://localhost:5609

### 目录说明

- `public/`：静态资源目录，可直接通过浏览器访问
- `contents/`：存放 Markdown 文件的目录，支持多级子目录
- `config/`：存放自动生成的 `tree.json` 文件
- 'images/'：存放图片的目录，支持多级子目录


### 自动生成内容树

每当 `contents/` 目录下的文件或文件夹发生变动时：
1. 系统会自动生成/更新 `config/tree.json` 文件，描述当前 Markdown 文件的目录结构
2. 前端页面会自动更新导航标签和目录显示，无需手动刷新页面

### 实时更新功能
项目使用WebSocket实现实时更新功能，具有以下特点：
- 当contents目录下的文件结构发生变化时，前端界面会自动更新
- 新增/删除文件或目录时，导航标签和侧边栏会自动同步更新
- 当前正在阅读的文章不会受到影响，保持阅读连续性

### 注意事项

- 首次运行会自动创建 `contents` 和 `config` 目录（如不存在）
- 仅支持 `.md` 后缀的 Markdown 文件
- 本项目为后端服务，需配合前端页面或工具进行内容展示

---
如需将项目改造成纯静态网页，请参考服务端代码说明，预生成 `tree.json` 后部署所有静态资源。
