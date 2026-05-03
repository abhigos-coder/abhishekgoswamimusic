import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { formatPrice } from '@/types/database';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DeleteCourseButton from '@/components/admin/DeleteCourseButton';
import { Plus, Pencil, Video } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage Courses' };

export default async function AdminCoursesPage() {
  const { data: courses } = await getSupabaseAdmin()
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Courses</h1>
        <Link href="/admin/courses/new">
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            New Course
          </Button>
        </Link>
      </div>

      {courses && courses.length > 0 ? (
        <div className="bg-surface rounded-xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-border bg-surface-light">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Title</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Price</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
                <th className="text-right px-4 py-3 text-text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text font-medium truncate max-w-xs">{course.title}</td>
                  <td className="px-4 py-3 text-text-muted">{formatPrice(course.price)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={course.is_published ? 'success' : 'warning'}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/courses/${course.id}/videos`}>
                        <Button variant="ghost" size="sm" title="Manage videos" aria-label={`Manage videos for ${course.title}`}>
                          <Video className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit course" aria-label={`Edit ${course.title}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <p className="text-text-muted mb-4">No courses yet. Create your first course.</p>
          <Link href="/admin/courses/new">
            <Button variant="primary">Create Course</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
