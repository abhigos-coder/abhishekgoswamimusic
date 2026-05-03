import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import CourseForm from '@/components/admin/CourseForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit Course' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;

  const { data: course } = await getSupabaseAdmin()
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (!course) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Edit Course</h1>
      <div className="max-w-2xl bg-surface rounded-xl border border-border p-6">
        <CourseForm course={course} />
      </div>
    </div>
  );
}
