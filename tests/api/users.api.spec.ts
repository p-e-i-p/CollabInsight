import { test, expect } from '@playwright/test';
import { API_CONFIG, TEST_USERS } from './api.config';

const { baseURL } = API_CONFIG;

/**
 * 用户API测试
 */
test.describe('用户API测试', () => {
  let authToken: string;
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    // 登录获取普通用户token
    const loginResponse = await request.post(`${baseURL}/api/login`, {
      data: {
        username: TEST_USERS.leader.username,
        password: TEST_USERS.leader.password,
      },
    });
    const loginBody = await loginResponse.json();
    authToken = loginBody.token;

    // 尝试登录管理员（如果存在）
    try {
      const adminResponse = await request.post(`${baseURL}/api/login`, {
        data: {
          username: TEST_USERS.admin.username,
          password: TEST_USERS.admin.password,
        },
      });
      if (adminResponse.ok()) {
        const adminBody = await adminResponse.json();
        adminToken = adminBody.token;
      }
    } catch (e) {
      // 管理员可能不存在，忽略
    }
  });

  test('GET /api/profile - 获取个人资料', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('username');
  });

  test('PUT /api/profile - 更新个人资料', async ({ request }) => {
    const updateData = {
      username: TEST_USERS.leader.username, // 保持原用户名
    };

    const response = await request.put(`${baseURL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: updateData,
    });

    expect(response.status()).toBe(200);
  });

  test('GET /api/search - 搜索用户', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/search`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: {
        keyword: 'leader',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('GET /api/users - 获取所有用户（需要管理员权限）', async ({ request }) => {
    if (!adminToken) {
      test.skip();
      return;
    }

    const response = await request.get(`${baseURL}/api/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });
});


