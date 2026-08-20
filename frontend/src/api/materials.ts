import { api } from './client';

export interface StudyMaterial {
  id: number;
  title: string;
  source: string;
  subject: string;
  chapter: string;
  url: string;
  summary: string;
  topics: string[];
  book_url?: string;
}

export const materialsApi = {
  getMaterials: async (level: string = 'school'): Promise<StudyMaterial[]> => {
    return await api.get<StudyMaterial[]>(`/api/v1/materials/?level=${level}`);
  },
};
