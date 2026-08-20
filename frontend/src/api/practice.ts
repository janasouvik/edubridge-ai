import { api } from './client';
import type { PracticeSession, PracticeSubmitResult } from '../types';

export const practiceApi = {
  generateSession: async (subject: string, level: string = "school"): Promise<PracticeSession> => {
    return await api.post<PracticeSession>('/api/v1/practice/generate', { subject, level });
  },
  
  submitSession: async (sessionId: number, answers: Record<number, string>): Promise<PracticeSubmitResult> => {
    return await api.post<PracticeSubmitResult>(`/api/v1/practice/${sessionId}/submit`, { answers });
  },
};
