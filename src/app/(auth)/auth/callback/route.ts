import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
    const cookieStore = await cookies();

    // Track cookies that need to be set on the redirect response
    const cookiesToForward: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookiesToForward.push({ name, value, options: options as Record<string, unknown> });
              try {
                cookieStore.set(name, value, options);
              } catch {
                // May fail in read-only contexts
              }
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const fallback = redirect === '/reset-password' ? '/forgot-password' : '/login';
      return NextResponse.redirect(`${origin}${fallback}?error=link_expired`);
    }

    // Forward auth cookies on the redirect response so the session persists
    const response = NextResponse.redirect(`${origin}${redirect}`);
    for (const { name, value, options } of cookiesToForward) {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
    }
    return response;
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
