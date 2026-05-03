'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import ThemeToggle from '@/components/layout/ThemeToggle';
import type { User } from '@supabase/supabase-js';

const PROFILE_CACHE_KEY = 'navbar_admin_role';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      // Serve from sessionStorage cache to avoid a DB round-trip on every navigation
      const cached = sessionStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        setIsAdmin(cached === 'admin');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (data?.role) {
        sessionStorage.setItem(PROFILE_CACHE_KEY, data.role);
        setIsAdmin(data.role === 'admin');
      }
    };

    // onAuthStateChange fires near-instantly with INITIAL_SESSION from the local
    // cookie cache — no network round-trip needed, unlike getUser().
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchRole(currentUser.id);
      } else {
        setIsAdmin(false);
        sessionStorage.removeItem(PROFILE_CACHE_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem(PROFILE_CACHE_KEY);
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="sticky top-0 z-50 bg-navbar-bg border-b border-navbar-border">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-display text-lg sm:text-xl font-bold tracking-tight text-navbar-text">
            {SITE_NAME}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm tracking-wide transition-colors ${
                  pathname === link.href ? 'text-navbar-text font-semibold' : 'text-navbar-text-muted hover:text-navbar-text'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <ThemeToggle />

            {user && isAdmin && (
              <>
                <span className="w-px h-4 bg-navbar-border mx-2" />
                <Link
                  href="/admin"
                  className="px-3 py-1.5 text-xs text-navbar-text-muted hover:text-navbar-text transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 inline mr-1" />
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-navbar-text-muted hover:text-navbar-text transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger — 44px touch target */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-3 -mr-2 text-navbar-text-muted hover:text-navbar-text"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-navbar-border bg-navbar-bg">
          <div className="px-6 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-3 text-base transition-colors ${
                  pathname === link.href ? 'text-navbar-text font-semibold' : 'text-navbar-text-muted hover:text-navbar-text'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-navbar-border pt-3 mt-3">
              {user && isAdmin ? (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm text-navbar-text-muted hover:text-navbar-text"
                  >
                    Admin Panel
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="block py-3 text-sm text-danger"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center pt-1">
                  <span className="ml-auto"><ThemeToggle /></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
