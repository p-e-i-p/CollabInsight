import { http } from '@/utils/http';
import type { UserProfile, UpdateProfileParams } from '../type';

export const getUserProfile = () => {
  return http.get<UserProfile>('/api/profile');
};

export const updateUserProfile = (params: UpdateProfileParams) => {
  return http.put<any>('/api/profile', params, {
    showSuccessToast: true,
  });
};

export const uploadAvatar = (formData: FormData) => {
  return http.post<any>('/api/avatar', formData, {
    showSuccessToast: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
