'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
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
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setEmailSent(true);
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

  if (emailSent || magicLinkSent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5 text-success" />
        </div>
        <h3 className="text-sm font-medium text-text mb-2">Check your email</h3>
        <p className="text-xs text-text-muted mb-6">
          {magicLinkSent
            ? 'We sent you a login link. Click it to sign in — no password needed.'
            : 'We sent a verification link to your email. Click the link to activate your account.'}
        </p>
        <Link
          href="/login"
          className="text-xs text-primary hover:text-primary-hover"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="fullName"
          name="fullName"
          label="Full Name"
          placeholder="Your name"
          required
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="your@email.com"
          required
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="At least 6 characters"
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-3 bg-primary text-background text-sm font-medium rounded hover:bg-primary-hover transition-colors disabled:opacity-40"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-text-dim">or sign up without a password</span>
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
        Already have an account?{' '}
        <Link
          href={`/login${redirect !== '/dashboard' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-primary hover:text-primary-hover"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
