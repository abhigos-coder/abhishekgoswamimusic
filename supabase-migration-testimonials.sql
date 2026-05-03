-- ============================================================================
-- Testimonials table — stores screenshot images of student feedback
-- Run this in Supabase SQL Editor after the site_settings migration
-- ============================================================================

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient ordering
CREATE INDEX idx_testimonials_sort_order ON public.testimonials (sort_order);

-- RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_public_read" ON public.testimonials
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "testimonials_service_all" ON public.testimonials
  FOR ALL TO service_role USING (true) WITH CHECK (true);
