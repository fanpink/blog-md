# Blog-md

[English Version](README.md)

本项目是一个简单的博客系统，博客内容直接存放在 `contents` 目录下。通过文件夹的组织结构，自动映射到导航栏中。需要注意的是，`index.md` 文件不会出现在目录导航中，而是直接作为首页显示。

## 技术栈

- 后端: Node.js + Express.js
- Markdown解析: markdown-it
- 实时更新: WebSocket (ws)
- 图表支持: mermaid
- 文件监控: chokidar
- 构建工具: webpack

## 支持效果

- 根据目录结构自动生成导航栏
- 内容实时更新无需刷新页面
- 支持在Markdown中使用mermaid图表
- 支持亮色/暗色主题切换
- 代码语法高亮显示

## 开发调试

```bash
# 安装依赖
npm install

# 启动开发服务器(带热更新)
npm run dev

# 构建前端资源
npm run build

# 启动生产环境服务器
npm start
```

## Docker部署

1. 构建Docker镜像:
```bash
docker-compose build
```

2. 启动容器:
```bash
docker-compose up -d
```

3. 访问博客: http://localhost:5609

## 配置说明

- 服务器端口可在`server.js`中修改
- 主题设置可在`public/theme/`目录下修改
- Markdown扩展可在`server.js`中配置
