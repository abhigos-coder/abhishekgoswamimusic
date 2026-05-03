import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminLoginForm from '@/components/forms/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false }, // keep out of search engines
};

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="label-mono mb-3">Admin</p>
          <h1 className="text-2xl font-bold text-text">Admin access</h1>
          <p className="text-sm text-text-muted mt-1">Restricted area</p>
        </div>
        <div className="border border-border rounded-lg p-6">
          <Suspense>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
