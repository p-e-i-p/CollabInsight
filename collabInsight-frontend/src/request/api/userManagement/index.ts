import { http } from '@/utils/http';
import type { UserProfile } from '@/request/type';

export const getUsers = () => {
  return http.get('/api/users').then((data) => {
    // 确保返回的数据是数组
    const result = Array.isArray(data) ? data : [];
    return result;
  }).catch((error) => {
    console.error('获取用户列表API调用失败:', error);
    throw error;
  });
};

export const getUserById = (id: string) => {
  return http.get<UserProfile>(`/api/users/${id}`);
};

export const updateUser = (id: string, data: Partial<UserProfile>) => {
  return http.put(`/api/users/${id}`, data, {
    showSuccessToast: true,
  });
};

export const deleteUser = (id: string) => {
  return http.delete(`/api/users/${id}`, {
    showSuccessToast: true,
  });
};

export const createUser = (data: Omit<UserProfile, '_id'>) => {
  return http.post('/api/users', data, {
    showSuccessToast: true,
  });
};