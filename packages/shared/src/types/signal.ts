export type SignalType = 'skip' | 'interest' | 'save' | 'long_press';

export interface SignalContext {
  position_in_session: number;
  time_spent_viewing: number;
  previous_signals: string[];
}

export interface Signal {
  id: string;
  user_id: string;
  product_id: string;
  experiment_id: string | null;
  signal_type: SignalType;
  authority_weight: number;
  context: SignalContext;
  created_at: string;
}
