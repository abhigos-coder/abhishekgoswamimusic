'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-success text-lg">✓</span>
        </div>
        <h3 className="text-sm font-medium text-text mb-2">Check your email</h3>
        <p className="text-xs text-text-muted mb-6">
          We sent a password reset link. It may take a minute to arrive.
        </p>
        <Link
          href="/login"
          className="text-xs text-primary hover:text-primary-hover"
        >
          Back to login
        </Link>
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
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-3 bg-primary text-background text-sm font-medium rounded hover:bg-primary-hover transition-colors disabled:opacity-40"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-center text-xs text-text-dim">
        Remember your password?{' '}
        <Link href="/login" className="text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
