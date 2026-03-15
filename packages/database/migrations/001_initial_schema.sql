--fashiondiscovery database schema

--users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  full_name TEXT,
  aesthetic_vibe TEXT,
  fashion_preferences JSONB DEFAULT '{}',
  authority_score FLOAT DEFAULT 0,
  taste_profile JSONB DEFAULT '{}',
  total_signals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

--brands table
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  experiment_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  images JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--experiments table
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'single_validation',
  target_signals INTEGER DEFAULT 5000,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--add foreign key for products.experiment_id
ALTER TABLE products ADD CONSTRAINT fk_experiment 
  FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE SET NULL;

--signals table
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES experiments(id) ON DELETE SET NULL,
  signal_type TEXT NOT NULL,
  authority_weight FLOAT DEFAULT 1.0,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--moodboards table
CREATE TABLE moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--moodboard_items table
CREATE TABLE moodboard_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

--indexes for performance
CREATE INDEX idx_signals_product ON signals(product_id, created_at);
CREATE INDEX idx_signals_experiment ON signals(experiment_id, signal_type);
CREATE INDEX idx_signals_user ON signals(user_id, created_at);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_experiment ON products(experiment_id);
CREATE INDEX idx_experiments_brand ON experiments(brand_id);
CREATE INDEX idx_moodboards_user ON moodboards(user_id);
