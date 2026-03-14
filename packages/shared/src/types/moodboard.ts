export interface Moodboard {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  created_at: string;
}

export interface MoodboardItem {
  id: string;
  moodboard_id: string;
  product_id: string;
  added_at: string;
}
