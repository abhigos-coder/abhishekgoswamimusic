-- ============================================================================
-- Site Settings table — stores editable About page content (image + bio)
-- Run this in Supabase SQL Editor after the main migration
-- ============================================================================

CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_image_url TEXT,
  about_bio TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed a single row so .single() queries always return a result
INSERT INTO public.site_settings (about_image_url, about_bio) VALUES (NULL, NULL);

-- Reuse the existing update_updated_at() trigger function
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "site_settings_service_all" ON public.site_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
