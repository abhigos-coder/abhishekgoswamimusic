import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Access Restored',
};

export default function RecoverAccessSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-success text-2xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-text mb-3">Access Restored!</h1>
        <p className="text-sm text-text-muted mb-8">
          Your purchased courses are now accessible on this device.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-primary text-background text-sm font-medium rounded hover:bg-primary-hover transition-colors"
        >
          Browse Courses
        </Link>
        <p className="mt-4 text-xs text-text-dim">
          Need help?{' '}
          <Link href="/about#contact" className="text-primary hover:text-primary-hover">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
