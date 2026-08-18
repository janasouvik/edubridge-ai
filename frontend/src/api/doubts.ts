import { api } from './client';
import type { DoubtRequest, DoubtResponse } from '../types';

export const doubtsApi = {
  askDoubt: (data: DoubtRequest) =>
    api.post<DoubtResponse>('/api/v1/doubts', data),
};
