export interface TasteProfile {
  style_preferences: string[];
  coherence_score: number;
  segment_affinity: Record<string, number>;
}

export interface User {
  id: string;
  phone_number: string;
  authority_score: number;
  taste_profile: TasteProfile;
  total_signals: number;
  created_at: string;
  updated_at: string;
}
