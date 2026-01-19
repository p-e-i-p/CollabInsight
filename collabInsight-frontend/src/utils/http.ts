import { message } from 'antd';
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type Method,
  type AxiosResponse,
  type AxiosRequestHeaders,
  type AxiosError,
} from 'axios';

// ========================= 1. 扩展 Axios 类型 =========================
declare module 'axios' {
  interface AxiosRequestConfig<D = any> {
    showSuccessToast?: boolean;
    headers?: AxiosRequestHeaders;
    needLoading?: boolean;
  }
}

// ========================= 响应数据结构类型 =========================
interface ApiResponse<T = any> {
  code?: number;
  msg?: string;
  data?: T;
  message?: string;
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
  (error: AxiosError) => {
    console.error('请求拦截器错误:', error);
    message.error('请求发送失败，请重试');
    return Promise.reject(error);
  }
);

// ========================= 5. 响应拦截器（统一处理结果） =========================
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;

    // 检查请求是否成功
    // 如果响应有 code 字段且不为 200，且没有 data，则视为错误
    if (res.code !== undefined && res.code !== 200 && !res.data) {
      // 401 未授权，需要重新登录
      if (res.code === 401) {
        message.error('登录过期，请重新登录');
        auth.removeToken();
        sessionStorage.removeItem('userRole');
        window.location.href = '/login';
        return Promise.reject(new Error('未授权'));
      }
      // 其他错误
      message.error(res.msg || res.message || '请求失败');
      return Promise.reject(new Error(res.msg || res.message || '请求失败'));
    }

    // 成功响应，显示成功提示（如果配置了）
    if (response.config.showSuccessToast) {
      message.success(res.msg || res.message || '请求成功');
    }

    // 返回数据：优先返回 res.data，如果没有则返回整个 res
    const result = res.data !== undefined ? res.data : res;

    return result;
  },
  (error: AxiosError<ApiResponse>) => {
    // 网络错误或请求超时
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        message.error('请求超时，请检查网络连接');
      } else {
        message.error('网络错误，请检查网络连接');
      }
      return Promise.reject(error);
    }

    // 服务器返回了错误响应
    const { response } = error;
    const errorData = response.data;

    // 401 未授权
    if (response.status === 401) {
      message.error('登录过期，请重新登录');
      auth.removeToken();
      sessionStorage.removeItem('userRole');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 其他错误，优先显示服务器返回的错误信息
    const errorMessage =
      errorData?.message || errorData?.msg || error.message || `服务器错误 (${response.status})`;
    message.error(errorMessage);

    return Promise.reject(error);
  }
);

// ========================= 6. 封装请求函数 =========================
interface RequestOptions<T = any> {
  url: string;
  method: Method;
  data?: T;
  params?: Record<string, any>;
  showSuccessToast?: boolean;
  needLoading?: boolean;
  headers?: AxiosRequestHeaders;
}

/**
 * 通用请求函数
 * @param options 请求配置
 * @returns Promise<T> 返回类型化的响应数据
 */
const request = <T = any>(options: RequestOptions<T>): Promise<T> => {
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
