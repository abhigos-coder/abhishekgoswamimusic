'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';

const ERROR_MESSAGES: Record<string, string> = {
  'missing-token': 'Invalid recovery link. Please request a new one.',
  'invalid-token': 'Invalid recovery link. Please request a new one.',
  'expired': 'Your recovery link has expired. Please request a new one.',
  'no-purchases': 'No purchases found for this email.',
  'server-error': 'Something went wrong. Please try again.',
};

export default function RecoverAccessForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(ERROR_MESSAGES[urlError] || 'Something went wrong. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const res = await fetch('/api/recover-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-success text-lg">✓</span>
        </div>
        <h3 className="text-sm font-medium text-text mb-2">Check your email</h3>
        <p className="text-xs text-text-muted mb-6">
          We sent a recovery link. Click it to restore access on this device.
        </p>
        <Link
          href="/"
          className="text-xs text-primary hover:text-primary-hover"
        >
          Browse courses
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
          {loading ? 'Sending...' : 'Send Recovery Link'}
        </button>
      </form>

      <p className="text-center text-xs text-text-dim">
        Don&apos;t have a course?{' '}
        <Link href="/" className="text-primary hover:text-primary-hover">
          Browse courses
        </Link>
      </p>
    </div>
  );
}
