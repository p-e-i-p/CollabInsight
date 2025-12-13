import { http, auth } from '@/utils/http';
import { type LoginResponse, type LoginParams } from '@/request/type';
export const login = (params: LoginParams) => {
  // 不设置 showSuccessToast，登录成功后会跳转，不需要显示成功消息
  return http.post<LoginResponse>('/api/login', params).then(res => {
    return res;
  }).catch(error => {
    console.error('登录失败:', error);
    throw error;
  });
};
export const getUserInfo = () => {
  return http.get<LoginResponse>('/api/userInfo');
};
