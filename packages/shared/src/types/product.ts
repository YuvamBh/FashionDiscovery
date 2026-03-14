export type ProductStatus = 'draft' | 'live' | 'completed';

export interface Product {
  id: string;
  brand_id: string;
  experiment_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  images: string[];
  status: ProductStatus;
  created_at: string;
}
