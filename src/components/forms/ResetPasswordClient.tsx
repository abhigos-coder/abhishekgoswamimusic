'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const code = searchParams.get('code');

    const init = async () => {
      if (code) {
        // Exchange the code for a session client-side
        // The browser Supabase client has access to the code_verifier it stored
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace('/forgot-password?error=link_expired');
          return;
        }
      }

      // Verify we have a valid session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/forgot-password');
        return;
      }

      setReady(true);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-muted">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <p className="label-mono mb-3">Account</p>
        <h1 className="text-2xl font-bold text-text">New password</h1>
        <p className="text-sm text-text-muted mt-1">Enter your new password below</p>
      </div>
      <div className="border border-border rounded-lg p-6">
        <ResetPasswordForm />
      </div>
    </>
  );
}
