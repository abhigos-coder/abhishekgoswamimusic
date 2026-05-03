import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import VideoManager from '@/components/admin/VideoManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage Videos' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ManageVideosPage({ params }: Props) {
  const { id } = await params;

  const [{ data: course }, { data: videos }] = await Promise.all([
    getSupabaseAdmin().from('courses').select('id, title').eq('id', id).single(),
    getSupabaseAdmin()
      .from('course_videos')
      .select('*')
      .eq('course_id', id)
      .order('sort_order'),
  ]);

  if (!course) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-1">Manage Videos</h1>
      <p className="text-text-muted mb-6">Course: {course.title}</p>
      <VideoManager courseId={course.id} initialVideos={videos ?? []} />
    </div>
  );
}
