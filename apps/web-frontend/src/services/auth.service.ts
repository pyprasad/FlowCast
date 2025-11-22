import { apiClient } from '../lib/api-client';
import { ApiResponse, User, AuthTokens } from '@creatorflow/types';

export const authService = {
  async register(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<
      ApiResponse<{ user: User; tokens: AuthTokens }>
    >('/auth/register', { email, password });
    return response.data.data!;
  },

  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<
      ApiResponse<{ user: User; tokens: AuthTokens }>
    >('/auth/login', { email, password });
    return response.data.data!;
  },

  async verifyEmail(token: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      `/auth/verify-email?token=${token}`
    );
    return response.data.data!.user;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/request-password-reset', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};
