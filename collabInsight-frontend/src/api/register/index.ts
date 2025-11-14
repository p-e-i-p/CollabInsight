import { http } from '@/utils/http';
import type { LoginResponse } from '@/api/login/type';

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export const register = (params: RegisterParams) => {
  return http.post<LoginResponse>('/register', params, {
    showSuccessToast: true,
  });
};
