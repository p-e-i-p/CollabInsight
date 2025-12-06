import { http, auth } from '@/utils/http';
import { type LoginResponse, type LoginParams } from '@/request/type';
export const login = (params: LoginParams) => {
  return http.post<LoginResponse>('/api/login', params, {
    showSuccessToast: true,
  }).then(res => {
    return res;
  }).catch(error => {
    console.error('登录失败:', error);
    throw error;
  });
};
export const getUserInfo = () => {
  return http.get<LoginResponse>('/api/userInfo');
};
