import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Allowlist of paths the auth callback may redirect to.
// Never allow external URLs or arbitrary paths to prevent open-redirect attacks.
const ALLOWED_REDIRECT_PATHS = ['/admin', '/admin/dashboard', '/reset-password'];

function safeRedirectPath(raw: string | null): string {
  if (!raw) return '/admin';
  // Must be a relative path starting with /
  if (!raw.startsWith('/')) return '/admin';
  // Must be in the allowlist
  if (ALLOWED_REDIRECT_PATHS.some((allowed) => raw === allowed || raw.startsWith(allowed + '/'))) {
    return raw;
  }
  return '/admin';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = safeRedirectPath(searchParams.get('redirect'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Code exchange failed — redirect to forgot-password with error hint
      const fallback = redirect === '/reset-password' ? '/forgot-password' : '/login';
      return NextResponse.redirect(
        `${origin}${fallback}?error=link_expired`
      );
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
