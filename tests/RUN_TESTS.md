# 测试运行指南

## 快速开始

### 1. 安装依赖
```bash
cd tests
npm install
```

### 2. 启动服务
**终端1 - 启动后端服务器：**
```bash
cd ../collabInsight-server
npm run dev
```

**终端2 - 启动前端服务器：**
```bash
cd ../collabInsight-frontend
npm run dev
```

**终端3 - 运行测试：**
```bash
cd tests
npm test
```

## 测试命令

### 运行所有测试
```bash
npm test
# 或
npm run test:all
```

### 只运行后端API测试
```bash
npm run test:api
```

### 只运行前端E2E测试
```bash
npm run test:frontend
```

### 运行特定测试文件
```bash
# 登录测试
npm run test:login:simple

# 项目管理测试
npx playwright test features/projects.spec.ts

# Bug API测试
npx playwright test api/bugs.api.spec.ts
```

### 交互式测试（推荐用于调试）
```bash
npm run test:ui
```

### 有头模式（可以看到浏览器）
```bash
npm run test:headed
```

### 调试模式
```bash
npm run test:debug
```

## 测试覆盖范围

### ✅ 后端API测试（已完成）

- [x] 认证API（登录、注册、获取用户信息）
- [x] 用户API（个人资料、搜索用户、用户管理）
- [x] 项目API（CRUD操作、任务管理）
- [x] Bug API（CRUD操作、审核）
- [x] 消息API（获取消息历史）
- [x] 数据分析API（数据概览）

### ✅ 前端E2E测试（已完成）

- [x] 登录功能
- [x] Dashboard页面
- [x] 项目管理（创建、编辑、搜索）
- [x] 任务管理（创建任务）
- [x] Bug管理（创建Bug）
- [x] 消息中心（发送消息）

## 测试数据

测试使用的默认用户：
- **leader** / 123456 - 组长用户（用于大部分测试）
- **member** / 123456 - 普通成员用户
- **admin** / 123456 - 管理员用户（如果存在）

## 测试报告

运行测试后，查看HTML报告：
```bash
npm run report
```

报告会显示：
- 测试通过/失败状态
- 执行时间
- 错误信息
- 截图（如果失败）

## 常见问题

### 1. 测试失败：连接被拒绝
**原因：** 后端或前端服务器未启动
**解决：** 确保两个服务器都在运行

### 2. 测试失败：认证失败
**原因：** 测试用户不存在或密码错误
**解决：** 检查数据库中的用户数据，或运行初始化脚本

### 3. 测试超时
**原因：** 服务器响应慢或网络问题
**解决：** 
- 增加 `playwright.config.ts` 中的超时时间
- 检查服务器性能
- 使用 `test:headed` 模式查看实际情况

### 4. 元素找不到
**原因：** 页面结构变化或选择器错误
**解决：**
- 使用 `test:ui` 模式查看页面
- 检查选择器是否正确
- 增加等待时间

## 持续集成

可以在CI/CD流程中运行测试：

```yaml
# GitHub Actions 示例
- name: Run Tests
  run: |
    cd tests
    npm install
    npm test
```

## 测试维护

### 添加新测试
1. 在相应的目录创建 `.spec.ts` 文件
2. 使用 `test.describe` 组织测试
3. 使用 `test.beforeEach` 设置测试环境
4. 运行测试确保通过

### 更新测试
当功能变化时：
1. 更新相应的测试文件
2. 运行测试确保通过
3. 更新 `TEST_PLAN.md` 文档

## 性能测试

当前测试主要关注功能正确性。如需性能测试：
1. 使用 Playwright 的性能API
2. 测量页面加载时间
3. 测试API响应时间
4. 使用专门的性能测试工具（如 k6）

