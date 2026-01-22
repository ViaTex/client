import axiosInstance from '@/lib/axios';
import type { UserProfile } from './user.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>(`/users/${userId}`);
    return response.data.data;
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await axiosInstance.put<ApiResponse<UserProfile>>(`/users/${userId}`, data);
    return response.data.data;
  },
};
