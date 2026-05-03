import type { Metadata } from 'next';
import { Suspense } from 'react';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="label-mono mb-3">Account</p>
          <h1 className="text-2xl font-bold text-text">Reset password</h1>
          <p className="text-sm text-text-muted mt-1">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>
        <div className="border border-border rounded-lg p-6">
          <Suspense>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
