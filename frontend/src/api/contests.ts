import { api } from './client';

export interface Contest {
  id: number;
  title: string;
  domain: string;
  target_grade: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'upcoming' | 'live' | 'completed';
  participants: number;
  created_at: string;
}

export interface ContestQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  position: number;
}

export interface ContestDetail extends Contest {
  questions: ContestQuestion[];
}

export interface RatingData {
  current: number;
  change: number;
  rank: number;
  totalParticipants: number;
}

export interface ContestSubmitResult {
  score: number;
  total: number;
  rating_change: number;
  new_rating: number;
  detailed_results: Array<{
    question_id: number;
    is_correct: boolean;
    correct_option: string;
    explanation: string;
  }>;
}

export const contestApi = {
  listContests: () => {
    return api.get<Contest[]>('/api/v1/contests/');
  },
  
  getContestDetail: (id: number) => {
    return api.get<ContestDetail>(`/api/v1/contests/${id}`);
  },

  submitContest: (id: number, answers: Record<string, string>) => {
    return api.post<ContestSubmitResult>(`/api/v1/contests/${id}/submit`, { answers });
  },

  getMyRating: () => {
    return api.get<RatingData>('/api/v1/contests/rating/me');
  }
};
