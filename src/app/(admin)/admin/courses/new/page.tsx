import CourseForm from '@/components/admin/CourseForm';

export const metadata = { title: 'Create Course' };

export default function NewCoursePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Create New Course</h1>
      <div className="max-w-2xl bg-surface rounded-xl border border-border p-6">
        <CourseForm />
      </div>
    </div>
  );
}
