import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Service-role client for profile lookups (bypasses RLS)
let _adminClient: ReturnType<typeof createAdminClient> | null = null;
function getAdmin() {
  if (!_adminClient) {
    _adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // ── CSRF: reject cross-origin state-mutating API requests ───────────────────
  // Razorpay callback (`/api/razorpay/*`) and contact form (`/api/contact`) must
  // originate from the same origin.  Browsers always send Origin on cross-origin
  // POST requests; its absence (direct server-to-server) is allowed.
  if (
    request.method !== 'GET' &&
    request.method !== 'HEAD' &&
    request.nextUrl.pathname.startsWith('/api/')
  ) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Protect admin routes — requires authentication + admin role
  // /admin/login is the login page itself — must be reachable unauthenticated
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    request.nextUrl.pathname !== '/admin/login'
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const redirect = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
      return redirect;
    }

    // Use service-role client to bypass RLS for the profile check
    const { data: profile } = await getAdmin()
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>();

    if (profile?.role !== 'admin') {
      const redirect = NextResponse.redirect(new URL('/', request.url));
      response.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
      return redirect;
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
