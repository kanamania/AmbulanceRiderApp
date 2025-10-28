import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';
import { User, CreateUserData, UpdateUserData, PaginatedResponse } from '../types';

interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

class UserService {
  // Get all users with pagination (Admin, Dispatcher only)
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role) params.append('role', filters.role);
      
      const response = await apiService.get<PaginatedResponse<User>>(
        `${API_CONFIG.ENDPOINTS.USERS.LIST}?${params.toString()}`
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      throw new Error(message);
    }
  }

  // Get all users (Admin, Dispatcher only)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiService.get<User[]>(API_CONFIG.ENDPOINTS.USERS.LIST);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      throw new Error(message);
    }
  }

  // Get user by ID
  async getUser(id: number): Promise<User> {
    try {
      const response = await apiService.get<User>(API_CONFIG.ENDPOINTS.USERS.GET(id));
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user';
      throw new Error(message);
    }
  }

  // Get user by ID (alias)
  async getUserById(id: number): Promise<User> {
    return this.getUser(id);
  }

  // Create new user (Admin only)
  async createUser(data: CreateUserData): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('phoneNumber', data.phoneNumber);
      formData.append('password', data.password);
      
      if (data.image) {
        formData.append('image', data.image);
      }
      
      data.roleIds.forEach(roleId => {
        formData.append('roleIds', roleId.toString());
      });

      const response = await apiService.post<User>(
        API_CONFIG.ENDPOINTS.USERS.CREATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      throw new Error(message);
    }
  }

  // Update user (Admin only)
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    try {
      const formData = new FormData();
      
      if (data.firstName) formData.append('firstName', data.firstName);
      if (data.lastName) formData.append('lastName', data.lastName);
      if (data.email) formData.append('email', data.email);
      if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
      if (data.password) formData.append('password', data.password);
      if (data.image) formData.append('image', data.image);
      if (data.removeImage !== undefined) formData.append('removeImage', data.removeImage.toString());
      
      if (data.roleIds) {
        data.roleIds.forEach(roleId => {
          formData.append('roleIds', roleId.toString());
        });
      }

      const response = await apiService.put<User>(
        API_CONFIG.ENDPOINTS.USERS.UPDATE(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      throw new Error(message);
    }
  }

  // Delete user (Admin only)
  async deleteUser(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.USERS.DELETE(id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      throw new Error(message);
    }
  }
}

export default new UserService();
