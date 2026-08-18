import { api } from './client';
import type { PracticeQuestion, PracticeResult, SubmitAnswerRequest } from '../types';

export const practiceApi = {
  getNextQuestion: () =>
    api.get<PracticeQuestion>('/api/v1/practice/next'),

  submitAnswer: (data: SubmitAnswerRequest) =>
    api.post<PracticeResult>('/api/v1/practice/submit', data),
};
