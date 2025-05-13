# 步骤 1: 指定基础镜像为 Node.js 20 Alpine (轻量级)
FROM docker.1ms.run/library/node

# 步骤 2: 在容器内创建并设置工作目录
WORKDIR /usr/src/app

# 步骤 3: 设置 chokidar 的环境变量，以便在 Docker 中更好地工作
ENV CHOKIDAR_USEPOLLING=true

# 步骤 4: 复制 package.json 和 package-lock.json (如果存在)
# 这样做可以利用 Docker 的缓存机制，如果这些文件没有改变，则不会重新执行 npm install
COPY package*.json ./

# 步骤 5: 安装项目依赖
# 如果你的 devDependencies 不需要在生产环境运行，可以使用 npm ci --omit=dev 或者 npm install --production
# 但因为 chokidar 在你的 dependencies 中，直接 npm install 是安全的
RUN npm install

# 步骤 6: 将项目中的所有其他文件复制到工作目录
COPY . .

# 步骤 7: 声明容器将监听的端口 (你的 server.js 中使用的是 8888)
EXPOSE 5609

# 步骤 8: 定义容器启动时执行的命令 (根据你的 package.json)
CMD [ "npm", "start" ]