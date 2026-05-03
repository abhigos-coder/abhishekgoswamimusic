import { cookies } from 'next/headers';
import Link from 'next/link';
import { CheckCircle, PlayCircle } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

interface Props {
  searchParams: Promise<{ course?: string }>;
}

export const metadata = { title: 'Payment Successful' };

export default async function PurchaseSuccessPage({ searchParams }: Props) {
  const { course: slug } = await searchParams;

  let courseTitle: string | null = null;
  let courseId: string | null = null;
  let hasValidAccess = false;

  if (slug) {
    const { data: course } = await getSupabaseAdmin()
      .from('courses')
      .select('id, title')
      .eq('slug', slug)
      .single();

    if (course) {
      courseTitle = course.title;
      courseId = course.id;

      // Confirm the access cookie is present and valid
      const cookieStore = await cookies();
      const accessToken = cookieStore.get(`purchase_access_${courseId}`)?.value;

      if (accessToken) {
        const { data: purchase } = await getSupabaseAdmin()
          .from('purchases')
          .select('id')
          .eq('access_token', accessToken)
          .eq('course_id', courseId)
          .eq('status', 'completed')
          .maybeSingle();

        hasValidAccess = !!purchase;
      }
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-text mb-3">Payment Successful!</h1>

        {courseTitle ? (
          <p className="text-sm text-text-muted mb-2">
            You now have lifetime access to{' '}
            <span className="text-text font-medium">{courseTitle}</span>.
          </p>
        ) : (
          <p className="text-sm text-text-muted mb-2">
            Your payment has been confirmed.
          </p>
        )}

        <p className="text-xs text-text-dim mb-8">
          A confirmation has been recorded. You can start watching immediately.
        </p>

        <div className="space-y-3">
          {hasValidAccess && slug ? (
            <Link
              href={`/courses/${slug}/watch`}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-background text-sm font-medium rounded hover:bg-primary-hover transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              Start Watching
            </Link>
          ) : slug ? (
            <Link
              href={`/courses/${slug}`}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-background text-sm font-medium rounded hover:bg-primary-hover transition-colors"
            >
              Go to Course
            </Link>
          ) : null}

          <Link
            href="/"
            className="block w-full px-5 py-2.5 text-sm text-text-muted hover:text-text transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-6 text-xs text-text-dim">
          Need help?{' '}
          <Link href="/about#contact" className="text-primary hover:text-primary-hover">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
