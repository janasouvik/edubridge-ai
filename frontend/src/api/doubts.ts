import { api } from './client';
import type { DoubtRequest, DoubtResponse } from '../types';

export const doubtsApi = {
  askDoubt: (data: DoubtRequest) =>
    api.post<DoubtResponse>('/api/v1/doubts', data),

  /**
   * Retrieve the authenticated user's doubt history.
   * TODO: Backend endpoint `GET /api/v1/doubts/history` does not exist yet.
   * This stub returns an empty array so the frontend is ready for a one-line
   * swap once the endpoint ships.
   */
  getHistory: async (): Promise<DoubtResponse[]> => {
    // Uncomment when backend endpoint exists:
    // return api.get<DoubtResponse[]>('/api/v1/doubts/history');
    return [];
  },
};

