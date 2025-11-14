export type LoginParams = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userInfo: {
    _id: number;
    username: string;
    role: 'admin'|'user';
  };
};

export type LoginError = {
  message: string;
}