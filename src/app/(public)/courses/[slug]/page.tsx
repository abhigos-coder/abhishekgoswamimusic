import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Lock, PlayCircle, Clock, HelpCircle } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { formatPrice, getYouTubeId } from '@/types/database';
import Badge from '@/components/ui/Badge';
import BuyButton from '@/components/courses/BuyButton';
import PreviewModal from '@/components/courses/PreviewModal';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: course } = await getSupabaseAdmin()
    .from('courses')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!course) return { title: 'Course Not Found' };
  return { title: course.title, description: course.description ?? undefined };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: course } = await getSupabaseAdmin()
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!course) notFound();

  const { data: videos } = await getSupabaseAdmin()
    .from('course_videos')
    .select('id, title, youtube_url, sort_order, is_preview, duration_minutes')
    .eq('course_id', course.id)
    .order('sort_order');

  // Build preview videos list with YouTube IDs for the client modal
  const previewVideos = (videos ?? [])
    .filter((v) => v.is_preview)
    .map((v) => ({ id: v.id, title: v.title, ytId: getYouTubeId(v.youtube_url) }))
    .filter((v): v is { id: string; title: string; ytId: string } => v.ytId !== null);

  // Check purchase via access token cookie (no auth required)
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(`purchase_access_${course.id}`)?.value;

  let hasPurchased = false;
  if (accessToken) {
    const { data: purchase } = await getSupabaseAdmin()
      .from('purchases')
      .select('id')
      .eq('access_token', accessToken)
      .eq('course_id', course.id)
      .eq('status', 'completed')
      .maybeSingle();
    hasPurchased = !!purchase;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Thumbnail */}
          <div className="aspect-video bg-surface rounded-lg overflow-hidden border border-border mb-8">
            {course.thumbnail_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-dim">
                <span className="text-5xl">♪</span>
              </div>
            )}
          </div>

          <p className="label-mono mb-4">Course</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-text leading-tight mb-6">
            {course.title}
          </h1>

          {course.description && (
            <p className="text-base text-text-muted leading-relaxed mb-12 whitespace-pre-line max-w-xl">
              {course.description}
            </p>
          )}

          {/* Curriculum */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <p className="label-mono">Curriculum</p>
              {videos && (
                <span className="text-sm text-text-dim">
                  {videos.length} lessons
                </span>
              )}
            </div>

            {videos && videos.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-4 px-5 py-3.5 bg-background hover:bg-surface transition-colors"
                  >
                    <span className="text-xs font-mono text-text-dim w-6">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {video.is_preview || hasPurchased ? (
                      <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-text-dim flex-shrink-0" />
                    )}
                    <span className="text-base text-text flex-1">{video.title}</span>
                    {video.is_preview && !hasPurchased && (
                      <Badge variant="default">Preview</Badge>
                    )}
                    {video.duration_minutes && (
                      <span className="text-xs text-text-dim flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration_minutes}m
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-dim">Curriculum coming soon.</p>
            )}

            {/* Preview video modal for non-purchasers */}
            {!hasPurchased && previewVideos.length > 0 && (
              <PreviewModal videos={previewVideos} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 border border-border rounded-lg p-6">
            <p className="text-3xl font-bold text-primary mb-6">
              {course.price === 0 ? 'Free' : formatPrice(course.price)}
            </p>

            {hasPurchased ? (
              <Link
                href={`/courses/${course.slug}/watch`}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-background text-base font-semibold rounded-lg hover:bg-primary-hover transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                Continue Watching
              </Link>
            ) : (
              <>
                <BuyButton
                  courseId={course.id}
                  courseTitle={course.title}
                  price={course.price}
                  slug={course.slug}
                />
                <p className="text-center mt-3">
                  <Link
                    href="/recover-access"
                    className="text-xs text-text-dim hover:text-primary transition-colors"
                  >
                    Already purchased? Recover access
                  </Link>
                </p>
              </>
            )}

            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <PlayCircle className="w-4 h-4 text-primary" />
                {videos?.length ?? 0} video lessons
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Clock className="w-4 h-4 text-primary" />
                Lifetime access
              </div>
              <Link
                href="/about#contact"
                className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-primary" />
                Need help? Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
