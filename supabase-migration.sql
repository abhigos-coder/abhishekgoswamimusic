-- ============================================================================
-- Abhishek Goswami Music — Database Migration (complete, current schema)
-- Run this in Supabase SQL Editor after creating your project
-- ============================================================================

-- PROFILES TABLE (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- COURSES TABLE
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_published ON public.courses(is_published);

-- COURSE VIDEOS TABLE
CREATE TABLE public.course_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT false,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_videos_course ON public.course_videos(course_id);

-- PURCHASES TABLE (guest checkout — user_id is nullable)
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,  -- nullable for guest purchases
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  email TEXT,          -- guest buyer email
  phone TEXT,          -- guest buyer phone
  access_token UUID DEFAULT gen_random_uuid() UNIQUE,  -- cookie-based content access
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchases_user ON public.purchases(user_id);
CREATE INDEX idx_purchases_course ON public.purchases(course_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_purchases_email ON public.purchases(email);
CREATE INDEX idx_purchases_access_token ON public.purchases(access_token);

-- CONTACT MESSAGES TABLE
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_service_all" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- COURSES (public read for published)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_public_read" ON public.courses
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "courses_service_all" ON public.courses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- COURSE VIDEOS (gated: preview visible to all, full access via service_role)
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_videos_preview" ON public.course_videos
  FOR SELECT TO anon, authenticated
  USING (is_preview = true);

CREATE POLICY "course_videos_service_all" ON public.course_videos
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- PURCHASES (service_role only — app uses admin client for all purchase operations)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_service_all" ON public.purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- CONTACT MESSAGES (insert by anyone, read by admin via service role)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages_insert" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "contact_messages_service_all" ON public.contact_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- STORAGE: Course Thumbnails Bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "course_thumbnails_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'course-thumbnails');

CREATE POLICY "course_thumbnails_service_write" ON storage.objects
  FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'course-thumbnails');

CREATE POLICY "course_thumbnails_service_update" ON storage.objects
  FOR UPDATE TO service_role
  USING (bucket_id = 'course-thumbnails');

CREATE POLICY "course_thumbnails_service_delete" ON storage.objects
  FOR DELETE TO service_role
  USING (bucket_id = 'course-thumbnails');

-- ============================================================================
-- AFTER SETUP: promote your account to admin
-- Run this after logging in for the first time on the new project:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================================
