import axios, { type AxiosRequestConfig } from 'axios';
import { API_URL } from '@/config/api';

export const API_BASE_URL = `${API_URL || 'http://localhost:8080'}/api/v1`;

const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Tự động unwrap ApiResponse, tránh lỗi double data (response.data.data)
instance.interceptors.response.use(
  (response) => {
    // Nếu backend trả về định dạng chuẩn ApiResponse { statusCode, success, message, data, timestamp }
    if (response.data && typeof response.data === 'object' && 'statusCode' in response.data) {
      if (!response.data.success) {
        return Promise.reject(new Error(response.data.message || 'Thao tác không thành công'));
      }
      return response.data.data; // Tự động bóc tách tầng data
    }
    return response.data;
  },
  (error) => {
    const apiError =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Đã có lỗi xảy ra khi kết nối máy chủ';
    return Promise.reject(new Error(apiError));
  }
);

const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.get(url, config) as unknown as Promise<T>,
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    instance.post(url, data, config) as unknown as Promise<T>,
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    instance.put(url, data, config) as unknown as Promise<T>,
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.delete(url, config) as unknown as Promise<T>,
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    instance.patch(url, data, config) as unknown as Promise<T>,
};

export default apiClient;
