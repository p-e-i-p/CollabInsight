export type LoginParams = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userInfo: {
    _id: string;
    username: string;
    role: 'admin' | 'user';
  };
};

export type LoginError = {
  message: string;
};
export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

// 用户个人信息类型
export interface UserProfile {
  _id: string;
  username: string;
  nickname: string;
  avatar?: string;
  gender: 'male' | 'female' | 'other';
  location?: string;
  bio: string;
  role: 'admin' | 'user';
}

export interface UpdateProfileParams {
  nickname?: string;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  bio?: string;
  avatar?: string;
}

export interface UploadAvatarResponse {
  avatar: string;
}

// 表单项布局组件的属性类型
export interface FormItemLayoutProps {
  label: string;
  colon?: boolean;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  rules?: any[];
  input: React.ReactNode;
}
export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: '未开始' | '进行中' | '已完成';
  priority: '高' | '中' | '普通' | '低';
  deadline?: string;
  leader: {
    _id: string;
    username: string;
    role: string;
  };
  members: Array<{
    _id: string;
    username: string;
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Bug {
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
}
export interface ChatMessageDto {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
}