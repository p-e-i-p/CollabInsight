import { test, expect } from '@playwright/test';
import { API_CONFIG, TEST_USERS, TEST_DATA } from './api.config';

const { baseURL } = API_CONFIG;

/**
 * 项目API测试
 */
test.describe('项目API测试', () => {
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
  });

  test('GET /api/projects - 获取项目列表', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('POST /api/projects - 创建项目', async ({ request }) => {
    const projectData = {
      ...TEST_DATA.project,
      name: `测试项目_${Date.now()}`,
    };

    const response = await request.post(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: projectData,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('_id');
    expect(body.data.name).toBe(projectData.name);
    
    projectId = body.data._id;
  });

  test('PUT /api/projects/:projectId - 更新项目', async ({ request }) => {
    // 先创建项目
    const createResponse = await request.post(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        ...TEST_DATA.project,
        name: `更新测试项目_${Date.now()}`,
      },
    });
    const createBody = await createResponse.json();
    const testProjectId = createBody.data._id;

    // 更新项目
    const updateData = {
      name: '更新后的项目名称',
      description: '更新后的描述',
      status: '已完成',
    };

    const response = await request.put(`${baseURL}/api/projects/${testProjectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: updateData,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe(updateData.name);
  });

  test('DELETE /api/projects/:projectId - 删除项目', async ({ request }) => {
    // 先创建项目
    const createResponse = await request.post(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        ...TEST_DATA.project,
        name: `删除测试项目_${Date.now()}`,
      },
    });
    const createBody = await createResponse.json();
    const testProjectId = createBody.data._id;

    // 删除项目
    const response = await request.delete(`${baseURL}/api/projects/${testProjectId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
  });

  test('GET /api/projects/:projectId/tasks - 获取项目任务列表', async ({ request }) => {
    // 先创建项目
    const createResponse = await request.post(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        ...TEST_DATA.project,
        name: `任务测试项目_${Date.now()}`,
      },
    });
    const createBody = await createResponse.json();
    const testProjectId = createBody.data._id;

    // 获取任务列表
    const response = await request.get(`${baseURL}/api/projects/${testProjectId}/tasks`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data || body)).toBe(true);
  });

  test('POST /api/projects/:projectId/tasks - 创建任务', async ({ request }) => {
    // 先创建项目
    const createResponse = await request.post(`${baseURL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        ...TEST_DATA.project,
        name: `创建任务测试项目_${Date.now()}`,
      },
    });
    const createBody = await createResponse.json();
    const testProjectId = createBody.data._id;

    // 获取项目成员（用于分配任务）
    const members = createBody.data.members || [];
    const assigneeId = members.length > 0 ? members[0]._id : createBody.data.leader._id;

    // 创建任务
    const taskData = {
      ...TEST_DATA.task,
      assignee: assigneeId,
    };

    const response = await request.post(`${baseURL}/api/projects/${testProjectId}/tasks`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: taskData,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data || body).toHaveProperty('_id');
  });
});

