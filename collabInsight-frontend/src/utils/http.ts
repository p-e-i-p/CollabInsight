import { message } from 'antd';
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type Method,
  type AxiosResponse,
  type AxiosRequestHeaders,
} from 'axios';

// ========================= 1. 扩展 Axios 类型 =========================
declare module 'axios' {
  interface AxiosRequestConfig<D = any> {
    showSuccessToast?: boolean;
    headers?: AxiosRequestHeaders;
    needLoading?: boolean;
  }
}

// ========================= 2. Token 存储工具 =========================
const auth = {
  getToken: (): string | null => sessionStorage.getItem('token'),
  setToken: (token: string): void => sessionStorage.setItem('token', token),
  removeToken: (): void => sessionStorage.removeItem('token'),
  isLogin: (): boolean => !!auth.getToken(),
};

// ========================= 3. 创建 Axios 实例 =========================
const service: AxiosInstance = axios.create({
  // 把 VITE_BASE_URL 改成 VITE_API_BASE_URL（和 .env 一致）
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  } as AxiosRequestHeaders,
});

// ========================= 4. 请求拦截器（仅添加 Token） =========================
service.interceptors.request.use(
  (config) => {
    const token = auth.getToken();
    config.headers = config.headers || ({} as AxiosRequestHeaders);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    message.error('请求发送失败，请重试');
    return Promise.reject(error);
  }
);

// ========================= 5. 响应拦截器（统一处理结果） =========================
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    console.log('HTTP响应数据:', res);
    // 检查请求是否成功
    if (res.code !== 200 && res.code !== undefined && !res.data) {
      if (res.code === 401) {
        message.error('登录过期，请重新登录');
        auth.removeToken();
        sessionStorage.removeItem('userRole');
        window.location.href = '/login';
      }
      message.error(res.msg || '请求失败');
      return Promise.reject(res);
    } else {
      if (response.config.showSuccessToast) {
        message.success(res.msg || '请求成功');
      }
      const result = res.data || res;
      console.log('HTTP响应处理后的数据:', result);
      return result;
    }
  },
  (error: any) => {
    // 如果服务器返回了错误信息，优先显示服务器返回的错误信息
    if (error.response && error.response.data && error.response.data.message) {
      message.error(error.response.data.message);
    } else {
      message.error(error.message || '服务器错误，请联系管理员');
    }
    return Promise.reject(error);
  }
);

// ========================= 6. 封装请求函数 =========================
type RequestOptions<T = any> = {
  url: string;
  method: Method;
  data?: T;
  params?: Record<string, any>;
  showSuccessToast?: boolean;
  needLoading?: boolean;
  headers?: AxiosRequestHeaders;
};

const request = <T = any>(options: RequestOptions): Promise<T> => {
  const {
    url,
    method,
    data,
    params,
    showSuccessToast = false,
    needLoading = false,
    headers,
  } = options;
  return service({
    url,
    method,
    data,
    params,
    showSuccessToast,
    needLoading,
    headers: headers || ({} as AxiosRequestHeaders),
  });
};

// 导出常用请求方法
export const http = {
  get: <T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
  ) => request<T>({ url, method: 'GET', params, ...options }),
  post: <T = any>(
    url: string,
    data?: any,
    options?: Omit<RequestOptions, 'url' | 'method' | 'params'>
  ) => request<T>({ url, method: 'POST', data, ...options }),
  put: <T = any>(
    url: string,
    data?: any,
    options?: Omit<RequestOptions, 'url' | 'method' | 'params'>
  ) => request<T>({ url, method: 'PUT', data, ...options }),
  delete: <T = any>(
    url: string,
    params?: Record<string, any>,
    options?: Omit<RequestOptions, 'url' | 'method' | 'data'>
  ) => request<T>({ url, method: 'DELETE', params, ...options }),
};

export { auth };
