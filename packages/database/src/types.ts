//generated types for supabase - replace after running supabase gen types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone_number: string;
          authority_score: number;
          taste_profile: Record<string, unknown>;
          total_signals: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone_number: string;
          authority_score?: number;
          taste_profile?: Record<string, unknown>;
          total_signals?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone_number?: string;
          authority_score?: number;
          taste_profile?: Record<string, unknown>;
          total_signals?: number;
          updated_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
        };
      };
      products: {
        Row: {
          id: string;
          brand_id: string;
          experiment_id: string | null;
          name: string;
          description: string | null;
          category: string | null;
          images: string[];
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          experiment_id?: string | null;
          name: string;
          description?: string | null;
          category?: string | null;
          images?: string[];
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          experiment_id?: string | null;
          name?: string;
          description?: string | null;
          category?: string | null;
          images?: string[];
          status?: string;
        };
      };
      experiments: {
        Row: {
          id: string;
          brand_id: string;
          name: string;
          type: string;
          target_signals: number;
          start_date: string | null;
          end_date: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          name: string;
          type?: string;
          target_signals?: number;
          start_date?: string | null;
          end_date?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          name?: string;
          type?: string;
          target_signals?: number;
          start_date?: string | null;
          end_date?: string | null;
          status?: string;
        };
      };
      signals: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          experiment_id: string | null;
          signal_type: string;
          authority_weight: number;
          context: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          experiment_id?: string | null;
          signal_type: string;
          authority_weight?: number;
          context?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          experiment_id?: string | null;
          signal_type?: string;
          authority_weight?: number;
          context?: Record<string, unknown>;
        };
      };
      moodboards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_public?: boolean;
        };
      };
      moodboard_items: {
        Row: {
          id: string;
          moodboard_id: string;
          product_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          moodboard_id: string;
          product_id: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          moodboard_id?: string;
          product_id?: string;
        };
      };
    };
  };
}
