import { http } from '@/utils/http';
import { type ChangePasswordParams } from '../type';

export const changePassword = (params: ChangePasswordParams) => {
  return http.post<any>('/api/change-password', params, {
    showSuccessToast: true,
  });
};