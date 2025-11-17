import { http } from '@/utils/http';
import { type RegisterParams, type LoginResponse } from '@/request/type';
export const register = (params: RegisterParams) => {
  return http.post<LoginResponse>('/register', params, {
    showSuccessToast: true,
  });
};
