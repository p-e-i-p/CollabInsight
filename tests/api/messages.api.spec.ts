import { test, expect } from '@playwright/test';
import { API_CONFIG, TEST_USERS, TEST_DATA } from './api.config';

const { baseURL } = API_CONFIG;

/**
 * 消息API测试
 */
test.describe('消息API测试', () => {
  let authToken: string;
  let projectId: string;

  test.beforeEach(async ({ request }) => {
    // 登录获取token
    const loginResponse = await request.post(`${baseURL}/api/login`, {
      data: {
        username: TEST_USERS.leader.username,
        password: TEST_USERS.leader.password,
      },
    });
    const loginBody = await loginResponse.json();
    authToken = loginBody.token;

    // 创建测试项目
    const projectResponse = await request.post(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        ...TEST_DATA.project,
        name: `消息测试项目_${Date.now()}`,
      },
    });
    const projectBody = await projectResponse.json();
    projectId = projectBody.data._id;
  });

  test('GET /api/messages/:projectId - 获取项目消息历史', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/messages/${projectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });
});




