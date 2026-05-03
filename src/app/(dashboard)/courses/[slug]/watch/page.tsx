import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import CoursePlayer from '@/components/player/CoursePlayer';
import type { CourseVideo } from '@/types/database';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { data: course } = await getSupabaseAdmin()
    .from('courses')
    .select('title')
    .eq('slug', slug)
    .single();
  return { title: course?.title ?? 'Watch Course' };
}

export default async function WatchCoursePage({ params }: Props) {
  const { slug } = await params;

  // Fetch course
  const { data: course } = await getSupabaseAdmin()
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!course) notFound();

  // Verify purchase via access token cookie
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(`purchase_access_${course.id}`)?.value;

  if (!accessToken) {
    redirect(`/courses/${slug}`);
  }

  const { data: purchase } = await getSupabaseAdmin()
    .from('purchases')
    .select('id')
    .eq('access_token', accessToken)
    .eq('course_id', course.id)
    .eq('status', 'completed')
    .maybeSingle();

  if (!purchase) {
    redirect(`/courses/${slug}`);
  }

  // Fetch all videos (user has a valid purchase)
  const { data: videos } = await getSupabaseAdmin()
    .from('course_videos')
    .select('*')
    .eq('course_id', course.id)
    .order('sort_order');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text mb-6">{course.title}</h1>
      <CoursePlayer videos={(videos as CourseVideo[]) ?? []} courseTitle={course.title} />
    </div>
  );
}
