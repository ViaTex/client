import axios from '@/lib/axios';
import type { UserProfile } from './user.types';

export const userService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await axios.get<UserProfile>(`/api/users/${userId}`);
    return response.data;
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await axios.put<UserProfile>(`/api/users/${userId}`, data);
    return response.data;
  },
};
