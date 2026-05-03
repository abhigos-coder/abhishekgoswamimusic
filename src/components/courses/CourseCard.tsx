import Link from 'next/link';
import { formatPrice, type Course } from '@/types/database';
import Badge from '@/components/ui/Badge';

interface Props {
  course: Course;
  purchased?: boolean;
}

export default function CourseCard({ course, purchased }: Props) {
  const href = purchased ? `/courses/${course.slug}/watch` : `/courses/${course.slug}`;

  return (
    <Link href={href} className="group block">
      {/* Thumbnail */}
      <div className="aspect-video bg-surface rounded-xl overflow-hidden border border-border group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(94,138,255,0.15)] transition-all duration-300 relative">
        {course.thumbnail_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-dim">
            <span className="text-5xl">♪</span>
          </div>
        )}
        {purchased && (
          <div className="absolute top-3 right-3">
            <Badge variant="success">Owned</Badge>
          </div>
        )}
        {/* Price badge overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 text-sm font-bold bg-primary text-background rounded-md">
            {course.price === 0 ? 'Free' : formatPrice(course.price)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4">
        <h3 className="text-base sm:text-lg font-bold text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-text-muted mt-1.5 line-clamp-2 leading-relaxed">{course.description}</p>
        )}
      </div>
    </Link>
  );
}
