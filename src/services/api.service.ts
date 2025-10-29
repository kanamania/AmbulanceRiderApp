import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, AxiosHeaders} from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token to requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          // Ensure headers object exists
          if (!config.headers) {
            config.headers = new AxiosHeaders();
          }
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle 401 errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // If error is 401, clear auth data and redirect to login
        if (error.response?.status === 401) {
          console.error('401 Unauthorized:', {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            responseData: error.response?.data,
            responseHeaders: error.response?.headers
          });
          
          // Don't clear auth or redirect for login endpoint failures
          if (error.config?.url?.includes('/auth/login')) {
            return Promise.reject(error);
          }
          
          this.clearAuthData();
          // Only redirect if not already on login/register pages
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem('refresh_token');
  }

  // Generic request methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  // Get the axios instance for custom configurations
  public getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default new ApiService();
