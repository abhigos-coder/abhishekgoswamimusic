'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  courseTitle: string;
  onConfirm: (email: string) => void;
  onClose: () => void;
  loading: boolean;
}

export default function GuestCheckoutModal({ courseTitle, onConfirm, onClose, loading }: Props) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validate = () => {
    const e: { email?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Please enter a valid email address';
    }
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    onConfirm(email.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60">
      <div className="relative w-full max-w-md bg-background border border-border rounded-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* 44px touch target */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2.5 text-text-dim hover:text-text transition-colors"
          disabled={loading}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-semibold text-text mb-1">Almost there</h2>
        <p className="text-xs text-text-muted mb-5">
          Enter your details to purchase <span className="text-text">{courseTitle}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5" htmlFor="guest-email">
              Email address <span className="text-danger">*</span>
            </label>
            <input
              id="guest-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-3 text-sm bg-surface border border-border rounded focus:outline-none focus:border-primary text-text placeholder:text-text-dim"
              disabled={loading}
            />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3.5 bg-primary text-background text-sm font-medium rounded hover:bg-primary-hover transition-colors disabled:opacity-40"
          >
            {loading ? 'Processing…' : 'Continue to Payment'}
          </button>
        </form>

        <p className="mt-4 text-xs text-text-dim text-center">
          Your details are used only for purchase records.{' '}
          <a href="/about#contact" className="text-primary hover:text-primary-hover">
            Need help?
          </a>
        </p>
      </div>
    </div>
  );
}
