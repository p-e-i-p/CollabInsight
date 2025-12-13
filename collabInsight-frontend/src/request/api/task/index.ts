import { http } from '@/utils/http';
import type { Project, Task } from '@/types/task';

export const fetchProjects = (params?: { keyword?: string }) => {
  return http.get<Project[]>('/api/projects', params);
};

export const createProject = (data: {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  deadline?: string;
  memberIds?: string[];
}) => {
  return http.post<Project>('/api/projects', data, { showSuccessToast: true });
};

export const fetchTasksByProject = (projectId: string) => {
  return http.get<Task[]>(`/api/projects/${projectId}/tasks`);
};

export const createTask = (projectId: string, data: Partial<Task>) => {
  return http.post<Task>(`/api/projects/${projectId}/tasks`, data, { showSuccessToast: true });
};

export const updateTask = (taskId: string, data: Partial<Task>) => {
  return http.put<Task>(`/api/projects/tasks/${taskId}`, data, { showSuccessToast: true });
};

export const deleteTask = (taskId: string) => {
  return http.delete(`/api/projects/tasks/${taskId}`, undefined, { showSuccessToast: true });
};

export const searchUserForProject = (projectId: string, keyword: string) => {
  return http.get(`/api/projects/${projectId}/searchUser`, { keyword });
};

export const searchUser = (keyword: string) => {
  return http.get('/api/search', { keyword });
};

export const updateProject = (projectId: string, data: {
  name?: string;
  description?: string;
  status?: '未开始' | '进行中' | '已完成';
  priority?: '高' | '中' | '普通' | '低';
  deadline?: string;
  memberIds?: string[];
}) => {
  return http.put<Project>(`/api/projects/${projectId}`, data, { showSuccessToast: true });
};

export const deleteProject = (projectId: string) => {
  return http.delete(`/api/projects/${projectId}`, undefined, { showSuccessToast: true });
};

