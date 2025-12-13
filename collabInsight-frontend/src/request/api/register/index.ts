import { http } from '@/utils/http';
import { type RegisterParams, type LoginResponse } from '@/request/type';
export const register = (params: RegisterParams) => {
  // 不设置 showSuccessToast，因为需要显示特殊的成功消息（包含请登录提示）
  return http.post<LoginResponse>('/api/register', params);
};
export type { RegisterParams };

