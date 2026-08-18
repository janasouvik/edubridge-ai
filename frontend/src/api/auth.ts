import { api } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/v1/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<{ message: string; user_id: number }>('/api/v1/auth/register', data),

  getMe: () =>
    api.get<User>('/api/v1/auth/me'),
};
