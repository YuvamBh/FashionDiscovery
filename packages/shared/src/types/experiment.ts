export type ExperimentStatus = 'draft' | 'running' | 'completed';
export type ExperimentType = 'single_validation' | 'a_b_test';

export interface Experiment {
  id: string;
  brand_id: string;
  name: string;
  type: ExperimentType;
  target_signals: number;
  start_date: string | null;
  end_date: string | null;
  status: ExperimentStatus;
  created_at: string;
}
