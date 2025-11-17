import { http } from '@/utils/http';
import { type LoginResponse, type LoginParams } from './type';
export const login = (params: LoginParams) => {
  return http.post<LoginResponse>('/login', params, {
    showSuccessToast: true,
  });
};
export const getUserInfo = () => {
  return http.get<LoginResponse>('/userInfo');
};
