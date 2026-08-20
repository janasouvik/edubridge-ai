// ─── User & Auth ────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  grade?: string;
  preferred_language?: string;
  learning_level?: string;
}

// ─── Doubt Solver ───────────────────────────────────────────────
export interface DoubtRequest {
  question: string;
  language?: string;
  subject?: string;
  topic?: string;
}

export interface Source {
  title: string;
  chapter: string | null;
  source_url: string | null;
  image_url?: string | null;
  relevance: number;
}

export interface DoubtResponse {
  answer: string;
  language: string;
  topic: string;
  sources: Source[];
}

// ─── Practice ───────────────────────────────────────────────────
export interface PracticeMCQ {
  id: number;
  position: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface PracticeSession {
  session_id: number;
  subject: string;
  questions: PracticeMCQ[];
}

export interface PracticeSubmitResult {
  session_id: number;
  score: number;
  total: number;
  detailed_results: {
    question_id: number;
    position: number;
    question_text: string;
    is_correct: boolean;
    student_answer: string;
    correct_option: string;
    explanation: string;
  }[];
}

// ─── Teacher Insights ───────────────────────────────────────────
export interface ClassSummary {
  total_students: number;
  students_needing_attention: number;
  average_accuracy: number;
}

export interface FlaggedStudent {
  student_id: number;
  student_name: string;
  risk_level: 'high' | 'medium' | 'low';
  accuracy: number;
  weak_topics: string[];
  reason: string;
  recommendation: string;
}

export interface TeacherInsights {
  class_summary: ClassSummary;
  flagged_students: FlaggedStudent[];
}

// ─── Scholarships ───────────────────────────────────────────────
export interface ScholarshipMatch {
  scholarship_id: number;
  name: string;
  provider: string;
  description: string;
  match_score: number;
  deadline: string | null;
  application_url: string | null;
  eligibility_reasons: string[];
}

export interface ScholarshipResponse {
  matches: ScholarshipMatch[];
}
