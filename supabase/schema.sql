-- ==============================================================================
-- DESIGNERSALE (DS/) — SUPABASE DATABASE SCHEMA
-- Clean, lightweight relational schema for local or cloud Supabase
-- ==============================================================================

-- 1. BOUTIQUES TABLE
CREATE TABLE IF NOT EXISTS boutiques (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  hours TEXT,
  price_tier TEXT DEFAULT '$$$',
  description TEXT,
  curator_note TEXT,
  image TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DYNAMIC PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  boutique_id TEXT REFERENCES boutiques(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  designer TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'AUD',
  image TEXT NOT NULL,
  description TEXT,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EDITORIAL GUIDES TABLE
CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  kicker TEXT,
  subtitle TEXT,
  reading_time TEXT DEFAULT '8 Min Read',
  hero_image TEXT NOT NULL,
  featured_boutiques TEXT[] DEFAULT '{}',
  content JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_boutiques_city ON boutiques(city);
CREATE INDEX IF NOT EXISTS idx_boutiques_category ON boutiques(category);
CREATE INDEX IF NOT EXISTS idx_products_boutique_id ON products(boutique_id);
CREATE INDEX IF NOT EXISTS idx_products_designer ON products(designer);
CREATE INDEX IF NOT EXISTS idx_guides_city ON guides(city);

-- Enable Row Level Security (RLS) with permissive read access for public
ALTER TABLE boutiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on boutiques" ON boutiques FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on boutiques" ON boutiques FOR ALL USING (true);

CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on products" ON products FOR ALL USING (true);

CREATE POLICY "Allow public read access on guides" ON guides FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on guides" ON guides FOR ALL USING (true);

