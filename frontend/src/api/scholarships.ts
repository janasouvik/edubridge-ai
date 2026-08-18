import { api } from './client';
import type { ScholarshipResponse } from '../types';

export const scholarshipsApi = {
  getMatches: () =>
    api.get<ScholarshipResponse>('/api/v1/scholarships/matches'),
};
