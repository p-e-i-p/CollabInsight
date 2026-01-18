import { test, expect } from '@playwright/test';
import { API_CONFIG, TEST_USERS, TEST_DATA } from './api.config';

const { baseURL } = API_CONFIG;

/**
 * Bug API测试
 */
test.describe('Bug API测试', () => {
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
        name: `Bug测试项目_${Date.now()}`,
      },
    });
    const projectBody = await projectResponse.json();
    projectId = projectBody.data._id;
  });

  test('GET /api/bugs/:projectId - 获取项目Bug列表', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/bugs/${projectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('POST /api/bugs/:projectId - 创建Bug', async ({ request }) => {
    // 获取项目成员用于分配
    const projectResponse = await request.get(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const projects = await projectResponse.json();
    const project = projects.data.find((p: any) => p._id === projectId);
    const assigneeId = project?.members?.[0]?._id || project?.leader?._id;

    const bugData = {
      ...TEST_DATA.bug,
      assignee: assigneeId,
    };

    const response = await request.post(`${baseURL}/api/bugs/${projectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: bugData,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data || body).toHaveProperty('_id');
  });

  test('PUT /api/bugs/:bugId - 更新Bug', async ({ request }) => {
    // 先创建Bug
    const projectResponse = await request.get(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const projects = await projectResponse.json();
    const project = projects.data.find((p: any) => p._id === projectId);
    const assigneeId = project?.members?.[0]?._id || project?.leader?._id;

    const createResponse = await request.post(`${baseURL}/api/bugs/${projectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        ...TEST_DATA.bug,
        assignee: assigneeId,
      },
    });
    const createBody = await createResponse.json();
    const bugId = (createBody.data || createBody)._id;

    // 更新Bug
    const updateData = {
      bugName: '更新后的Bug名称',
      status: '处理中',
    };

    const response = await request.put(`${baseURL}/api/bugs/${bugId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: updateData,
    });

    expect(response.status()).toBe(200);
  });

  test('DELETE /api/bugs/:bugId - 删除Bug', async ({ request }) => {
    // 先创建Bug
    const projectResponse = await request.get(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const projects = await projectResponse.json();
    const project = projects.data.find((p: any) => p._id === projectId);
    const assigneeId = project?.members?.[0]?._id || project?.leader?._id;

    const createResponse = await request.post(`${baseURL}/api/bugs/${projectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        ...TEST_DATA.bug,
        assignee: assigneeId,
      },
    });
    const createBody = await createResponse.json();
    const bugId = (createBody.data || createBody)._id;

    // 删除Bug
    const response = await request.delete(`${baseURL}/api/bugs/${bugId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
  });
});


