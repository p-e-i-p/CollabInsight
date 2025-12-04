export type LoginParams = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userInfo: {
    _id: number;
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
  avatar: string;
  gender: 'male' | 'female' | 'other';
  location: string;
  bio: string;
  role: 'admin' | 'user';
}

export interface UpdateProfileParams {
  nickname?: string;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  bio?: string;
}

export interface UploadAvatarResponse {
  avatar: string;
}