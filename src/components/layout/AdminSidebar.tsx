'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, CreditCard, MessageSquare, Image, Settings, ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Image },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const sidebarContent = (
    <>
      <div className="px-4 py-4 border-b border-border">
        <p className="text-sm font-semibold text-text">Admin</p>
        <p className="text-[0.6rem] text-text-dim font-mono uppercase tracking-widest mt-0.5">
          Abhishek Goswami Music
        </p>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-colors ${
                isActive
                  ? 'bg-surface text-primary'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border space-y-0.5">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2 rounded text-xs text-text-muted hover:text-text hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-danger hover:bg-surface transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-lg bg-surface border border-border text-text"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-background border-r border-border flex flex-col transition-transform lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute top-3 right-3 p-2 text-text-muted hover:text-text"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-background border-r border-border min-h-screen flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
