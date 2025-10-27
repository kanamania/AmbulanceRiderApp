import apiService from './api.service';
import { API_CONFIG } from '../config/api.config';
import { User, CreateUserData, UpdateUserData } from '../types';

class UserService {
  // Get all users (Admin, Dispatcher only)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiService.get<User[]>(API_CONFIG.ENDPOINTS.USERS.LIST);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiService.get<User>(API_CONFIG.ENDPOINTS.USERS.GET(id));
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
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
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
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
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  // Delete user (Admin only)
  async deleteUser(id: number): Promise<void> {
    try {
      await apiService.delete(API_CONFIG.ENDPOINTS.USERS.DELETE(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }
}

export default new UserService();
