import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordClient from '@/components/forms/ResetPasswordClient';

export const metadata: Metadata = {
  title: 'Set New Password',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-6">
      <div className="w-full max-w-sm">
        <Suspense
          fallback={
            <div className="text-center py-12">
              <p className="text-sm text-text-muted">Verifying reset link...</p>
            </div>
          }
        >
          <ResetPasswordClient />
        </Suspense>
      </div>
    </div>
  );
}
