
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'lapsed')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_start DATE,
  subscription_end DATE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  selected_charity_id UUID,
  charity_contribution_pct INTEGER DEFAULT 10 CHECK (charity_contribution_pct >= 10 AND charity_contribution_pct <= 100),
  total_won DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHARITIES TABLE
-- ============================================
CREATE TABLE charities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website TEXT,
  total_raised DECIMAL(10,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHARITY EVENTS TABLE
-- ============================================
CREATE TABLE charity_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GOLF SCORES TABLE
-- ============================================
CREATE TABLE golf_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE (user_id, played_date)
);

-- Index for fast user score lookups
CREATE INDEX idx_golf_scores_user_date ON golf_scores(user_id, played_date DESC);

-- ============================================
-- DRAWS TABLE
-- ============================================
CREATE TABLE draws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'simulated', 'published')),
  draw_type TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  winning_numbers INTEGER[] NOT NULL DEFAULT '{}',
  total_pool DECIMAL(10,2) DEFAULT 0,
  jackpot_pool DECIMAL(10,2) DEFAULT 0,
  four_match_pool DECIMAL(10,2) DEFAULT 0,
  three_match_pool DECIMAL(10,2) DEFAULT 0,
  jackpot_rolled_over BOOLEAN DEFAULT FALSE,
  rollover_amount DECIMAL(10,2) DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_month_year UNIQUE (month, year)
);

-- ============================================
-- DRAW ENTRIES TABLE (Users who entered a draw)
-- ============================================
CREATE TABLE draw_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scores_snapshot INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_draw_user UNIQUE (draw_id, user_id)
);

-- ============================================
-- WINNERS TABLE
-- ============================================
CREATE TABLE winners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
  matched_numbers INTEGER[],
  prize_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verification_required', 'approved', 'paid', 'rejected')),
  proof_url TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'prize_payout', 'charity_contribution', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEPENDENT DONATIONS TABLE
-- ============================================
CREATE TABLE donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FOREIGN KEY: Users -> Charities
-- ============================================
ALTER TABLE users ADD CONSTRAINT fk_users_charity 
  FOREIGN KEY (selected_charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- ============================================
-- SEED DATA: Sample Charities
-- ============================================
INSERT INTO charities (name, slug, description, short_description, category, is_featured) VALUES
(
  'Green Fairways Foundation',
  'green-fairways',
  'The Green Fairways Foundation connects golf with environmental conservation, funding initiatives to restore natural habitats, plant trees, and create sustainable green spaces across the UK. Every subscription helps us protect the planet one fairway at a time.',
  'Restoring natural habitats through golf community funding.',
  'Environment',
  TRUE
),
(
  'Swings for Hope',
  'swings-for-hope',
  'Swings for Hope brings the joy of golf to underprivileged youth across the country. We fund junior golf programs, provide equipment to schools in deprived areas, and run mentorship schemes that use sport to build character and open opportunities.',
  'Bringing golf to young people who deserve a chance.',
  'Youth & Sport',
  TRUE
),
(
  'Veterans on the Green',
  'veterans-on-green',
  'Veterans on the Green uses golf as a therapeutic tool for military veterans dealing with PTSD, injury recovery, and social isolation. Our programs have helped hundreds of veterans rebuild confidence and community through the sport.',
  'Using golf to support our veterans'' mental and physical wellbeing.',
  'Veterans & Health',
  FALSE
),
(
  'Birdie Cancer Research',
  'birdie-cancer',
  'Birdie Cancer Research funds cutting-edge oncology research and provides support to cancer patients and their families. Our golf community raises vital funds that directly support research breakthroughs and patient care programs.',
  'Funding cancer research through the passion of golf.',
  'Health & Research',
  TRUE
),
(
  'Links to Literacy',
  'links-to-literacy',
  'Links to Literacy runs reading programs in partnership with golf clubs nationwide, helping children and adults improve their literacy skills. Golf becomes the bridge to education — every round you play funds another learning session.',
  'Using golf clubs as community literacy hubs.',
  'Education',
  FALSE
);

-- ============================================
-- SEED: Admin User (password: Admin@123)
-- Update the password_hash after running:
-- node -e "const b=require('bcryptjs');console.log(b.hashSync('Admin@123',12))"
-- ============================================
-- INSERT INTO users (email, password_hash, full_name, role) VALUES
-- ('admin@golfcharity.com', 'REPLACE_WITH_HASH', 'Platform Admin', 'admin');

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own data
CREATE POLICY "users_own_data" ON users FOR ALL USING (auth.uid()::text = id::text);

-- Golf scores: users manage their own
CREATE POLICY "scores_own_data" ON golf_scores FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE id::text = auth.uid()::text)
);

-- Public read for charities and draws
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "charities_public_read" ON charities FOR SELECT USING (is_active = true);

ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "draws_public_read" ON draws FOR SELECT USING (status = 'published');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER charities_updated_at BEFORE UPDATE ON charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER draws_updated_at BEFORE UPDATE ON draws
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: Enforce 5-score limit per user
CREATE OR REPLACE FUNCTION enforce_score_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete oldest score if user already has 5
  DELETE FROM golf_scores 
  WHERE id IN (
    SELECT id FROM golf_scores 
    WHERE user_id = NEW.user_id 
    ORDER BY played_date DESC 
    OFFSET 4
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER score_limit_trigger AFTER INSERT ON golf_scores
  FOR EACH ROW EXECUTE FUNCTION enforce_score_limit();
