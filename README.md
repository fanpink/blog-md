# Blog-md

[中文版本](README.zh-cn.md)

This project is a simple blogging system where blog content is stored directly in the `contents` directory. The folder structure is automatically mapped to the navigation bar. Note that the `index.md` file will not appear in the navigation bar but will be displayed as the homepage.

## Technology Stack

- Backend: Node.js with Express.js
- Markdown parsing: markdown-it
- Real-time updates: WebSocket (ws)
- Diagram support: mermaid
- File watching: chokidar
- Build tool: webpack

## Features

- Automatic navigation generation from directory structure
- Real-time content updates without page refresh
- Support for mermaid diagrams in markdown
- Light/dark theme support
- Code syntax highlighting

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build frontend assets
npm run build

# Start production server
npm start
```

## Docker Deployment

1. Build the Docker image:
```bash
docker-compose build
```

2. Start the container:
```bash
docker-compose up -d
```

3. Access the blog at: http://localhost:5609

## Configuration

- The server port can be changed in `server.js`
- Theme settings can be modified in `public/theme/`
- Markdown extensions can be configured in `server.js`
