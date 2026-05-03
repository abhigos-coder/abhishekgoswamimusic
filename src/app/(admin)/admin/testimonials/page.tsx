import { getSupabaseAdmin } from '@/lib/supabase/admin';
import TestimonialManager from '@/components/admin/TestimonialManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Testimonials' };

export default async function AdminTestimonialsPage() {
  const { data: testimonials, error } = await getSupabaseAdmin()
    .from('testimonials')
    .select('*')
    .order('sort_order');

  if (error) {
    return (
      <div className="text-center py-16 bg-surface rounded-xl border border-border">
        <p className="text-text-muted">
          Could not load testimonials. Make sure the testimonials table exists.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Testimonials</h1>
      <TestimonialManager initialTestimonials={testimonials ?? []} />
    </div>
  );
}
