import { http } from '@/utils/http';
import { type ChangePasswordParams } from '../type';

export const changePassword = (params: ChangePasswordParams) => {
  // 不设置 showSuccessToast，因为需要显示特殊的成功消息（包含重新登录提示）
  return http.post<any>('/api/change-password', params);
};