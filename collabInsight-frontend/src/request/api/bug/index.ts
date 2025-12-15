
import { http } from '@/utils/http';
import type { Bug } from '@/types/bug';

export const fetchBugsByProject = (projectId: string) => {
  return http.get<Bug[]>(`/api/bugs/${projectId}`);
};

export const createBug = (projectId: string, data: Partial<Bug>) => {
  return http.post<Bug>(`/api/bugs/${projectId}`, data, { showSuccessToast: true });
};

export const updateBug = (bugId: string, data: Partial<Bug>) => {
  return http.put<Bug>(`/api/bugs/${bugId}`, data, { showSuccessToast: true });
};

export const deleteBug = (bugId: string) => {
  return http.delete(`/api/bugs/${bugId}`, undefined, { showSuccessToast: true });
};

export const approveBug = (bugId: string, data: { approvalStatus: '通过' | '不通过'; reviewComment?: string }) => {
  return http.post<Bug>(`/api/bugs/${bugId}/approve`, data, { showSuccessToast: true });
};

export const searchUserForBug = (projectId: string, keyword: string) => {
  return http.get(`/api/bugs/${projectId}/searchUser`, { keyword });
};
