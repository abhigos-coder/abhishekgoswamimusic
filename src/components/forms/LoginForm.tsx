'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(redirect);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMagicLinkLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('magic-email') as string;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setMagicLinkLoading(false);
      return;
    }

    setMagicLinkSent(true);
    setMagicLinkLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5 text-success" />
        </div>
        <h3 className="text-sm font-medium text-text mb-2">Check your email</h3>
        <p className="text-xs text-text-muted mb-6">
          We sent you a login link. Click it to sign in — no password needed.
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="text-xs text-primary hover:text-primary-hover"
        >
          Try a different method
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="your@email.com"
          required
        />
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Your password"
            required
            minLength={6}
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-text-dim hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-3 bg-primary text-background text-sm font-medium rounded hover:bg-primary-hover transition-colors disabled:opacity-40"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-text-dim">or</span>
        </div>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-3">
        <Input
          id="magic-email"
          name="magic-email"
          type="email"
          placeholder="your@email.com"
          required
        />
        <button
          type="submit"
          disabled={magicLinkLoading}
          className="w-full px-5 py-3 border border-border text-text text-sm rounded hover:border-primary transition-colors flex items-center justify-center disabled:opacity-40"
        >
          <Mail className="w-4 h-4 mr-2" />
          {magicLinkLoading ? 'Sending...' : 'Send me a magic link'}
        </button>
      </form>

      <p className="text-center text-xs text-text-dim">
        No account?{' '}
        <Link
          href={`/register${redirect !== '/dashboard' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-primary hover:text-primary-hover"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
