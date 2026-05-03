export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number; // in paise
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseVideo {
  id: string;
  course_id: string;
  title: string;
  youtube_url: string;
  sort_order: number;
  is_preview: boolean;
  duration_minutes: number | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string | null;
  course_id: string;
  email: string | null;
  phone: string | null;
  access_token: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number; // in paise
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  about_image_url: string | null;
  about_bio: string | null;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

// Helper type for course with videos
export interface CourseWithVideos extends Course {
  course_videos: CourseVideo[];
}

// Helper type for purchase with course
export interface PurchaseWithCourse extends Purchase {
  courses: Course;
}

// Helper to format price from paise to INR string
export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

// Helper to extract YouTube video ID from URL
export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/
  );
  return match ? match[1] : null;
}
