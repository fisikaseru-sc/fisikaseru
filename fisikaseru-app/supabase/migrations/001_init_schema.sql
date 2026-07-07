-- ═══════════════════════════════════════════════
-- FISIKASERU — PRODUCTION DATABASE SCHEMA
-- ═══════════════════════════════════════════════

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TRIGGER FUNCTIONS
-- Fungsi untuk mengupdate kolom updated_at secara otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLE: users
-- id merujuk langsung ke auth.users dari Supabase untuk integrasi otentikasi (OAuth/Magic Link)
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  level           TEXT CHECK (level IN ('smp','sma','kuliah')) DEFAULT 'sma',
  -- UU PDP Compliance
  consent_at      TIMESTAMPTZ,
  consent_version TEXT,
  birth_year      INTEGER,
  parent_email    TEXT,
  parent_verified BOOLEAN DEFAULT FALSE,
  parent_token    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Trigger untuk update updated_at di tabel users
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;


-- 4. TABLE: sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  module_id           TEXT NOT NULL, -- e.g., 'bandul'
  seed                INTEGER NOT NULL,
  difficulty_level    TEXT DEFAULT 'L2',
  current_step        INTEGER DEFAULT 1,
  status              TEXT CHECK (status IN ('active','completed','abandoned')) DEFAULT 'active',
  prediction_data     JSONB, -- prediction details
  reflection_data     JSONB, -- reflection responses
  final_r2            DECIMAL(5,4),
  accuracy_pct        DECIMAL(5,2),
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  last_active_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger untuk update updated_at di tabel sessions
CREATE TRIGGER set_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;


-- 5. TABLE: trials
CREATE TABLE IF NOT EXISTS public.trials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  trial_no        INTEGER NOT NULL,
  variables       JSONB NOT NULL, -- e.g., { L: 0.75, m: 0.1, theta: 10 }
  measured_value  DECIMAL(10,6) NOT NULL, -- observed period T
  true_value      DECIMAL(10,6),
  noise_applied   DECIMAL(10,8),
  derived_values  JSONB, -- e.g., { T2: 2.22 }
  is_anomaly      BOOLEAN DEFAULT FALSE,
  recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for trials
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;


-- 6. TABLE: subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan              TEXT CHECK (plan IN ('free','monthly','annual','student')),
  status            TEXT CHECK (status IN ('active','expired','cancelled','trial')) DEFAULT 'active',
  trial_ends_at     TIMESTAMPTZ,
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  expires_at        TIMESTAMPTZ,
  payment_provider  TEXT,
  payment_ref       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;


-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- Users: Read/Write own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Sessions: Read/Write own sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Trials: Read/Write trials of own sessions
CREATE POLICY "Users can view own trials" ON public.trials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE public.sessions.id = public.trials.session_id
      AND public.sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own trials" ON public.trials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE public.sessions.id = public.trials.session_id
      AND public.sessions.user_id = auth.uid()
    )
  );

-- Subscriptions: Read own status
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);


-- 8. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_trials_session ON public.trials(session_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);


-- 9. AUTH HOOK: AUTOMATIC USER CREATION
-- Membuat baris di public.users secara otomatis ketika ada user baru sign up di auth.users (Supabase Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. STORAGE: AVATARS BUCKET
-- Membuat bucket untuk menyimpan foto profil / avatar (diakses publik)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS untuk tabel storage.objects (Bucket avatars)
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( auth.uid() = owner )
  WITH CHECK ( bucket_id = 'avatars' );
