import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Set New Password',
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();

  // Verify user has a valid session (set by /auth/callback)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/forgot-password');
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="label-mono mb-3">Account</p>
          <h1 className="text-2xl font-bold text-text">New password</h1>
          <p className="text-sm text-text-muted mt-1">Enter your new password below</p>
        </div>
        <div className="border border-border rounded-lg p-6">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
