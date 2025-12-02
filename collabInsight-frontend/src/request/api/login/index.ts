import { http } from '@/utils/http';
import { type LoginResponse, type LoginParams } from '@/request/type';
export const login = (params: LoginParams) => {
  return http.post<LoginResponse>('/api/login', params, {
    showSuccessToast: true,
  });
};
export const getUserInfo = () => {
  return http.get<LoginResponse>('/api/userInfo');
};
