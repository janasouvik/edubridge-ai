import { api } from './client';
import type { TeacherInsights } from '../types';

export const teacherApi = {
  getInsights: () =>
    api.get<TeacherInsights>('/api/v1/teacher/insights'),
};
