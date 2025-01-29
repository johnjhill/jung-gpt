export interface DreamAnalysis {
  initialAnalysis: string;
  questions: string[];
  answers?: string[];
  finalAnalysis?: string;
}

export interface DreamRecord {
  id: string;
  user_id: string;
  dream_content: string;
  analysis: DreamAnalysis;
  summary: string;
  created_at: string;
  updated_at: string;
  dream_date: string;
}