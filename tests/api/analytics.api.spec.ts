import { test, expect } from '@playwright/test';
import { API_CONFIG, TEST_USERS } from './api.config';

const { baseURL } = API_CONFIG;

/**
 * 数据分析API测试
 */
test.describe('数据分析API测试', () => {
  let authToken: string;

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
  });

  test('GET /api/analytics/overview - 获取数据概览', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/analytics/overview`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('summary');
    expect(body.data.summary).toHaveProperty('projects');
    expect(body.data.summary).toHaveProperty('tasks');
    expect(body.data.summary).toHaveProperty('bugs');
    expect(body.data.summary).toHaveProperty('members');
  });
});

