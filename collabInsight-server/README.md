# CollabInsight 后端服务器

CollabInsight 的后端服务器，提供用户认证和协作功能。

## 功能

- 用户注册和登录
- JWT 身份验证
- 用户信息获取
- MongoDB 数据库集成

## 安装

1. 克隆仓库

```bash
git clone [repository-url]
cd collabInsight-server
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建 `.env` 文件，并设置以下变量：

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabInsight
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

4. 启动服务器

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API 端点

### 用户认证

- `POST /login` - 用户登录
  请求体:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
  响应:
  ```json
  {
    "token": "string",
    "userInfo": {
      "_id": "string",
      "username": "string",
      "role": "user|admin"
    }
  }
  ```

- `GET /userInfo` - 获取当前用户信息
  需要在请求头中提供有效的 JWT token
  响应:
  ```json
  {
    "token": "string",
    "userInfo": {
      "_id": "string",
      "username": "string",
      "role": "user|admin"
    }
  }
  ```

## 开发工具

- 使用 Prettier 进行代码格式化

```bash
npm run format
```

## 技术栈

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Prettier
