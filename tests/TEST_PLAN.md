# CollabInsight 全面测试计划

## 测试覆盖范围

### 前端 E2E 测试（Playwright）

#### 1. 认证模块
- [x] 登录功能
- [ ] 注册功能
- [ ] 登出功能
- [ ] 未授权访问重定向

#### 2. Dashboard（数据概览）
- [ ] 页面加载和数据展示
- [ ] 统计数据准确性
- [ ] 图表渲染
- [ ] 项目进度展示

#### 3. 项目管理
- [ ] 创建项目
- [ ] 编辑项目
- [ ] 删除项目
- [ ] 项目列表展示
- [ ] 项目搜索
- [ ] 添加项目成员
- [ ] 项目状态更新

#### 4. 任务管理
- [ ] 创建任务
- [ ] 编辑任务
- [ ] 删除任务
- [ ] 任务列表展示
- [ ] 任务筛选（状态、优先级）
- [ ] 任务分配
- [ ] 任务状态更新

#### 5. Bug管理
- [ ] 创建Bug
- [ ] 编辑Bug
- [ ] 删除Bug
- [ ] Bug列表展示
- [ ] Bug筛选（状态、严重程度）
- [ ] Bug分配
- [ ] Bug审核（组长功能）

#### 6. 消息中心
- [ ] 发送消息
- [ ] 查看消息历史
- [ ] 实时消息接收
- [ ] @成员功能
- [ ] 表情符号

#### 7. 用户管理（管理员）
- [ ] 用户列表展示
- [ ] 创建用户
- [ ] 编辑用户
- [ ] 删除用户
- [ ] 用户搜索

### 后端 API 测试

#### 1. 认证API
- [ ] POST /api/login - 登录
- [ ] POST /api/register - 注册
- [ ] GET /api/userInfo - 获取用户信息
- [ ] POST /api/change-password - 修改密码

#### 2. 用户API
- [ ] GET /api/profile - 获取个人资料
- [ ] PUT /api/profile - 更新个人资料
- [ ] POST /api/avatar - 上传头像
- [ ] GET /api/search - 搜索用户
- [ ] GET /api/users - 获取所有用户（管理员）
- [ ] GET /api/users/:id - 获取单个用户（管理员）
- [ ] POST /api/users - 创建用户（管理员）
- [ ] PUT /api/users/:id - 更新用户（管理员）
- [ ] DELETE /api/users/:id - 删除用户（管理员）

#### 3. 项目API
- [ ] GET /api/projects - 获取项目列表
- [ ] POST /api/projects - 创建项目
- [ ] GET /api/projects/:projectId/tasks - 获取项目任务
- [ ] POST /api/projects/:projectId/tasks - 创建任务
- [ ] PUT /api/projects/:projectId - 更新项目
- [ ] DELETE /api/projects/:projectId - 删除项目
- [ ] PUT /api/projects/tasks/:taskId - 更新任务
- [ ] DELETE /api/projects/tasks/:taskId - 删除任务
- [ ] GET /api/projects/:projectId/searchUser - 搜索项目用户

#### 4. Bug API
- [ ] GET /api/bugs/:projectId - 获取项目Bug列表
- [ ] POST /api/bugs/:projectId - 创建Bug
- [ ] PUT /api/bugs/:bugId - 更新Bug
- [ ] DELETE /api/bugs/:bugId - 删除Bug
- [ ] POST /api/bugs/:bugId/approve - 审核Bug
- [ ] GET /api/bugs/:projectId/searchUser - 搜索Bug分配用户

#### 5. 消息API
- [ ] GET /api/messages/:projectId - 获取项目消息历史

#### 6. 数据分析API
- [ ] GET /api/analytics/overview - 获取数据概览

## 测试数据准备

### 测试用户
- leader/123456 - 组长用户
- member/123456 - 普通成员用户
- admin/123456 - 管理员用户（如果存在）

### 测试项目
- 自动创建测试项目
- 测试项目包含任务和Bug

## 测试执行顺序

1. 后端API测试（确保API正常工作）
2. 前端E2E测试（依赖后端API）

## 测试环境要求

- 前端服务器运行在 http://localhost:5173
- 后端服务器运行在 http://localhost:5000（或配置的端口）
- MongoDB 数据库运行
- 测试数据已初始化



