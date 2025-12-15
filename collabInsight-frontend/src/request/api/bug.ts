
import http from '@/utils/http';

export interface BugCreateParams {
  bugName: string;
  bugDetails?: string;
  assignee: string;
  startDate?: string;
  deadline?: string;
  severity?: '严重' | '高' | '中' | '低';
  status?: '待处理' | '处理中' | '待审核' | '已解决' | '已关闭' | '已取消';
}

export interface BugUpdateParams extends BugCreateParams {
  solution?: string;
}

export interface BugApprovalParams {
  approvalStatus: '通过' | '不通过';
  reviewComment?: string;
}

export type Bug = {
  _id: string;
  project: string;
  bugName: string;
  bugDetails?: string;
  assignee: {
    _id: string;
    username: string;
    role: string;
  };
  createdBy: {
    _id: string;
    username: string;
    role: string;
  };
  severity: '严重' | '高' | '中' | '低';
  status: '待处理' | '处理中' | '待审核' | '已解决' | '已关闭' | '已取消';
  solution?: string;
  resolvedBy?: {
    _id: string;
    username: string;
    role: string;
  };
  resolvedAt?: string;
  approvalStatus: '待审核' | '通过' | '不通过';
  reviewer?: {
    _id: string;
    username: string;
    role: string;
  };
  reviewComment?: string;
  reviewedAt?: string;
  startDate?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
};

// 获取项目下的Bug列表
export const fetchBugsByProject = (projectId: string) => {
  return http.get<Bug[]>(`/api/bugs/${projectId}`);
};

// 创建Bug
export const createBug = (projectId: string, data: BugCreateParams) => {
  return http.post<Bug>(`/api/bugs/${projectId}`, data);
};

// 更新Bug
export const updateBug = (bugId: string, data: BugUpdateParams) => {
  return http.put<Bug>(`/api/bugs/${bugId}`, data);
};

// 删除Bug
export const deleteBug = (bugId: string) => {
  return http.delete(`/api/bugs/${bugId}`);
};

// 审核Bug
export const approveBug = (bugId: string, data: BugApprovalParams) => {
  return http.post<Bug>(`/api/bugs/${bugId}/approve`, data);
};

// 搜索用户，用于分配Bug
export const searchUserForBug = (projectId: string, keyword: string) => {
  return http.get(`/api/bugs/${projectId}/searchUser?keyword=${keyword}`);
};
