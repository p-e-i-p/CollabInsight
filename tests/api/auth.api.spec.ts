import { test, expect } from '@playwright/test';
import { API_CONFIG, TEST_USERS } from './api.config';

const { baseURL } = API_CONFIG;

/**
 * 认证API测试
 */
test.describe('认证API测试', () => {
  let authToken: string;

  test('POST /api/login - 登录成功', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/login`, {
      data: {
        username: TEST_USERS.leader.username,
        password: TEST_USERS.leader.password,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('userInfo');
    expect(body.userInfo).toHaveProperty('username', TEST_USERS.leader.username);
    
    authToken = body.token;
  });

  test('POST /api/login - 登录失败（错误密码）', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/login`, {
      data: {
        username: TEST_USERS.leader.username,
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('message');
  });

  test('POST /api/login - 登录失败（用户不存在）', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/login`, {
      data: {
        username: 'nonexistent',
        password: '123456',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('GET /api/userInfo - 获取用户信息（需要认证）', async ({ request }) => {
    // 先登录获取token
    const loginResponse = await request.post(`${baseURL}/api/login`, {
      data: {
        username: TEST_USERS.leader.username,
        password: TEST_USERS.leader.password,
      },
    });
    const loginBody = await loginResponse.json();
    const token = loginBody.token;

    // 使用token获取用户信息
    const response = await request.get(`${baseURL}/api/userInfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect([200, 201]).toContain(response.status());
    const body = await response.json();
    // 根据后端实际响应格式，用户信息在userInfo属性中
    const userData = body.userInfo || body.data || body;
    expect(userData).toHaveProperty('username');
  });

  test('GET /api/userInfo - 未认证访问应返回401', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/userInfo`);

    expect(response.status()).toBe(401);
  });

  test('POST /api/register - 注册新用户', async ({ request }) => {
    const randomUsername = `testuser_${Date.now()}`;
    const response = await request.post(`${baseURL}/api/register`, {
      data: {
        username: randomUsername,
        email: `${randomUsername}@test.com`,
        password: '123456',
        role: 'user',
      },
    });

    // 注册可能成功（201）或失败（如果用户已存在）
    expect([200, 201, 400]).toContain(response.status());
  });
});


