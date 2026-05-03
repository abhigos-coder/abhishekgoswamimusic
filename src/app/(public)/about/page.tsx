import type { Metadata } from 'next';
import ContactForm from '@/components/forms/ContactForm';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Abhishek Goswami — Jazz & Fingerstyle Guitarist.',
};

const DEFAULT_BIO =
  'Exploring the art of solo guitar — where jazz harmony meets fingerstyle technique. Through structured courses, Abhishek helps guitarists build a strong foundation in chord melody, walking bass lines, and solo arrangements.';

const highlights = [
  {
    label: 'Approach',
    title: 'Structured Learning',
    description:
      'Step-by-step curriculum designed for progressive growth. No guesswork — just the right things in the right order.',
  },
  {
    label: 'Style',
    title: 'Jazz Meets Fingerstyle',
    description:
      'Where chord melody, walking bass lines, and solo arrangements come together on a single guitar.',
  },
  {
    label: 'Access',
    title: 'Learn at Your Pace',
    description:
      'Lifetime access to all purchased content. Rewatch, revisit, and refine whenever you want.',
  },
];

const socials = [
  { name: 'YouTube', href: 'https://www.youtube.com/@AbhishekGoswamiMusic' },
  { name: 'Instagram', href: 'https://www.instagram.com/thisisabhishekgoswami/' },
  { name: 'Threads', href: 'https://www.threads.com/@thisisabhishekgoswami' },
  { name: 'Linktree', href: 'https://linktr.ee/thisisabhishekgoswami' },
];

export default async function AboutPage() {
  const { data: settings } = await getSupabaseAdmin()
    .from('site_settings')
    .select('about_image_url, about_bio')
    .single();

  const aboutImageUrl = settings?.about_image_url ?? null;
  const aboutBio = settings?.about_bio || DEFAULT_BIO;

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
      {/* Bio */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-[560px_1fr] gap-10 md:gap-12 mb-12">
          {/* Left — Image */}
          <div className="aspect-square rounded-lg border border-border bg-surface overflow-hidden flex items-center justify-center">
            {aboutImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={aboutImageUrl}
                alt="Abhishek Goswami"
                width={560}
                height={560}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-16 h-16 text-text-muted/40"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            )}
          </div>

          {/* Right — Bio + stats */}
          <div className="flex flex-col justify-center">
            <p className="label-mono mb-4">About</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-text mb-6">
              Abhishek Goswami
            </h1>
            <p className="text-sm text-text-muted leading-relaxed max-w-xl">
              {aboutBio}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden">
          {highlights.map((item) => (
            <div key={item.title} className="bg-background p-6 sm:p-8">
              <p className="text-[0.65rem] font-mono uppercase tracking-[0.18em] text-primary mb-3">
                {item.label}
              </p>
              <h3 className="text-base font-semibold text-text mb-2">{item.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-border pt-16">
        <p className="label-mono mb-10">Get in Touch</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left — Info */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-4">
              Let&apos;s Connect
            </h2>
            <p className="text-sm text-text-muted leading-relaxed mb-8 max-w-md">
              Have a question about courses, want to collaborate on a project, or
              looking to book for an event? Leave me a message — I typically respond
              within 24 hours.
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-[0.65rem] font-mono uppercase tracking-[0.18em] text-primary mb-2">
                  Email
                </p>
                <a
                  href="mailto:abgo4u@gmail.com"
                  className="text-sm text-text hover:text-primary transition-colors"
                >
                  abgo4u@gmail.com
                </a>
              </div>

              <div>
                <p className="text-[0.65rem] font-mono uppercase tracking-[0.18em] text-primary mb-3">
                  Social
                </p>
                <div className="flex items-center gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm border border-border rounded hover:border-primary hover:text-primary text-text-muted transition-colors"
                    >
                      {s.name} ↗
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="border border-border rounded-lg p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
