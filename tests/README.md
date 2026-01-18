# CollabInsight E2E 测试

使用 Playwright 进行端到端测试。

## 安装依赖

```bash
npm install
```

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行登录测试（简化版）
```bash
npm run test:login:simple
```

### 运行登录测试（完整版）
```bash
npm run test:login
```

### 以 UI 模式运行（推荐）
```bash
npm run test:ui
```

### 以有头模式运行（可以看到浏览器）
```bash
npm run test:headed
```

### 调试模式
```bash
npm run test:debug
```

### 查看测试报告
```bash
npm run report
```

## 测试前准备

1. **确保前端开发服务器正在运行**：
   ```bash
   cd ../collabInsight-frontend
   npm run dev
   ```
   服务器应该运行在 `http://localhost:5173`

2. **确保后端服务器正在运行**：
   ```bash
   cd ../collabInsight-server
   npm run dev
   ```
   服务器应该运行在 `http://localhost:5000`（或配置的端口）

3. **确保测试用户存在**：
   - 用户名: `leader`
   - 密码: `123456`

## 测试文件结构

```
tests/
├── api/                     # 后端API测试
│   ├── api.config.ts        # API测试配置
│   ├── auth.api.spec.ts    # 认证API测试
│   ├── projects.api.spec.ts # 项目API测试
│   ├── bugs.api.spec.ts     # Bug API测试
│   └── analytics.api.spec.ts # 数据分析API测试
├── auth/                    # 前端认证测试
│   ├── login.spec.ts       # 完整登录测试
│   └── login-simple.spec.ts # 简化登录测试
├── features/               # 前端功能E2E测试
│   ├── dashboard.spec.ts   # Dashboard测试
│   ├── projects.spec.ts    # 项目管理测试
│   ├── tasks.spec.ts       # 任务管理测试
│   ├── bugs.spec.ts        # Bug管理测试
│   └── messages.spec.ts    # 消息中心测试
├── helpers/                # 测试辅助函数
│   └── page-helpers.ts     # 页面操作辅助函数
├── screenshots/            # 测试截图（自动生成）
├── TEST_PLAN.md            # 测试计划文档
├── playwright.config.ts     # Playwright 配置
├── package.json            # 测试项目配置
└── tsconfig.json           # TypeScript 配置
```

## 测试类型

### 后端API测试
测试所有后端API端点的功能和响应：
```bash
npm run test:api
```

### 前端E2E测试
测试前端用户界面的完整流程：
```bash
npm run test:frontend
```

### 运行所有测试
```bash
npm run test:all
# 或
npm test
```

## 已修复的问题

1. ✅ **ES 模块支持**：添加了 `"type": "module"` 和 ES 模块的 `__dirname` 支持
2. ✅ **URL 验证修复**：根据实际路由配置，验证跳转到 `/` 而不是 `/dashboard`
3. ✅ **超时时间优化**：增加了超时时间，避免网络请求超时
4. ✅ **元素等待**：添加了元素可见性等待，确保元素加载完成
5. ✅ **路径处理**：修复了截图路径问题，使用正确的路径拼接
6. ✅ **baseURL 使用**：使用配置的 baseURL 而不是硬编码完整 URL

## 注意事项

- 测试截图会保存在 `screenshots/` 目录
- 测试报告会保存在 `playwright-report/` 目录
- 确保测试环境与开发环境一致
- 如果测试失败，检查：
  1. 前端服务器是否运行
  2. 后端服务器是否运行
  3. 测试用户是否存在
  4. 网络连接是否正常

## 常见问题

### 测试超时
如果测试超时，可以：
- 增加 `playwright.config.ts` 中的 `timeout` 值
- 检查服务器响应速度
- 使用 `test:headed` 模式查看实际运行情况

### 元素找不到
如果出现元素找不到的错误：
- 检查选择器是否正确
- 增加等待时间
- 使用 `test:headed` 模式查看页面实际状态

### 登录失败
如果登录测试失败：
- 确认用户名(leader)和密码(123456)正确
- 检查后端 API 是否正常
- 查看浏览器控制台错误信息
