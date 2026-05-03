import { createClient } from '@/lib/supabase/server';
import CourseCard from '@/components/courses/CourseCard';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
      <p className="label-mono mb-4">Jazz & Fingerstyle Guitar</p>
      <h1 className="text-4xl sm:text-5xl font-bold text-text mb-4">Courses</h1>
      <p className="text-base sm:text-lg text-text-muted mb-14 max-w-xl leading-relaxed">
        In-depth, structured courses to master jazz fingerstyle guitar.
      </p>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-base text-text-dim">No courses available yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
