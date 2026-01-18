/**
 * API 测试配置
 */
export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
  timeout: 30000,
};

/**
 * 测试用户凭据
 */
export const TEST_USERS = {
  leader: {
    username: 'leader',
    password: '123456',
  },
  member: {
    username: 'member',
    password: '123456',
  },
  admin: {
    username: 'admin',
    password: '123456',
  },
};

/**
 * 测试数据
 */
export const TEST_DATA = {
  project: {
    name: '测试项目',
    description: '这是一个测试项目',
    status: '进行中',
    priority: '高',
  },
  task: {
    taskName: '测试任务',
    taskDetails: '这是测试任务详情',
    status: '待办',
    urgency: '高',
  },
  bug: {
    bugName: '测试Bug',
    bugDetails: '这是测试Bug详情',
    severity: '高',
    status: '待处理',
  },
  message: {
    content: '这是一条测试消息',
    type: 'text',
  },
};

