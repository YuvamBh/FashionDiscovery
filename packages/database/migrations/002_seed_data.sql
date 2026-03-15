-- seed data for testing the application

-- 1. Create a dummy brand
INSERT INTO brands (id, name, email, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'STUDIO.NOIR', 'hello@studionoir.com', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'VOID.STUDIO', 'contact@void.studio', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'KAALA', 'info@kaala.co', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Create products for those brands
INSERT INTO products (id, brand_id, name, category, description, images, status)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111', 
    '11111111-1111-1111-1111-111111111111', 
    'Oversized Linen Shirt', 
    'Tops',
    'Breathable oversized linen shirt for summer.',
    '["https://picsum.photos/500/900?random=11"]'::jsonb,
    'live'
  ),
  (
    'a2222222-2222-2222-2222-222222222222', 
    '33333333-3333-3333-3333-333333333333', 
    'Graphic Tee', 
    'T-Shirts',
    'Heavyweight cotton graphic tee.',
    '["https://picsum.photos/500/900?random=12"]'::jsonb,
    'live'
  ),
  (
    'a3333333-3333-3333-3333-333333333333', 
    '11111111-1111-1111-1111-111111111111', 
    'Tailored Blazer', 
    'Outerwear',
    'Structured tailored blazer in wool blend.',
    '["https://picsum.photos/500/900?random=13"]'::jsonb,
    'live'
  ),
  (
    'a4444444-4444-4444-4444-444444444444', 
    '22222222-2222-2222-2222-222222222222', 
    'Minimal Hoodie', 
    'Hoodies',
    'Fleece backed minimal cut hoodie.',
    '["https://picsum.photos/500/900?random=14"]'::jsonb,
    'live'
  ),
  (
    'a5555555-5555-5555-5555-555555555555', 
    '11111111-1111-1111-1111-111111111111', 
    'Wide Leg Trousers', 
    'Bottoms',
    'Flowy wide leg trousers with pleated front.',
    '["https://picsum.photos/500/900?random=16"]'::jsonb,
    'live'
  )
ON CONFLICT (id) DO NOTHING;
