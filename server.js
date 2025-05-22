const express = require('express');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// 读取配置
const setting = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/config', 'setting.json'), 'utf-8'));
const PORT = setting.port || 5609; // 优先使用配置文件端口

const app = express();

// 设置静态文件目录
app.use(express.static('public'));
// app.use('public/config', express.static('config'));
// app.use('public/contents', express.static('contents'));
// app.use('public/images', express.static('images'));


// 监听contents目录变化
const contentsPath = path.join(__dirname, 'public/contents');
const configPath = path.join(__dirname, 'public/config');

// 确保目录存在
if (!fs.existsSync(contentsPath)) {
  fs.mkdirSync(contentsPath);
}
if (!fs.existsSync(configPath)) {
  fs.mkdirSync(configPath);
}

// 生成文件树结构
function generateFileTree() {
  const tree = {
    name: 'contents',
    type: 'directory',
    children: []
  };

  function buildTree(currentPath, currentNode) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        const dirNode = {
          name: item,
          type: 'directory',
          children: []
        };
        buildTree(itemPath, dirNode);
        currentNode.children.push(dirNode);
      } else if (path.extname(item) === '.md') {
        currentNode.children.push({
          name: item,
          type: 'file',
          path: path.relative(contentsPath, itemPath)
        });
      }
    });
  }

  buildTree(contentsPath, tree);
  fs.writeFileSync(path.join(configPath, 'tree.json'), JSON.stringify(tree, null, 2));
  return tree;
}

// 初始化文件树
generateFileTree();

// 创建HTTP服务器
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 广播文件树更新通知
function broadcastUpdate() {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'filetree-update' }));
    }
  });
}

// 监听文件变化
const watcher = chokidar.watch(contentsPath, {
  ignored: /(^|[\/\\])\../, // 忽略隐藏文件
  persistent: true,
  usePolling: true,         // 强制使用轮询机制
  interval: 1000            // 轮询间隔（毫秒）
});

watcher
  .on('add', path => {
    generateFileTree();
    broadcastUpdate();
  })
  .on('unlink', path => {
    generateFileTree();
    broadcastUpdate();
  })
  .on('addDir', path => {
    generateFileTree();
    broadcastUpdate();
  })
  .on('unlinkDir', path => {
    generateFileTree();
    broadcastUpdate();
  });