import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="text-sm font-semibold text-text">{SITE_NAME}</p>
            <p className="text-xs text-text-dim mt-1">{SITE_TAGLINE}</p>
          </div>

          {/* Links */}
          <div>
            <p className="label-mono mb-3">Navigate</p>
            <ul className="space-y-0.5">
              {[{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/about#contact' }].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-block py-1.5 text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="label-mono mb-3 mt-6">Legal</p>
            <ul className="space-y-0.5">
              {[{ label: 'Terms & Conditions', href: '/terms' }, { label: 'Privacy Policy', href: '/privacy' }, { label: 'Refund Policy', href: '/refund-policy' }].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-block py-1.5 text-sm text-text-muted hover:text-text transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="label-mono mb-3">Connect</p>
            <ul className="space-y-0.5">
              <li>
                <a
                  href="https://www.youtube.com/@AbhishekGoswamiMusic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1.5 text-sm text-text-muted hover:text-text transition-colors"
                >
                  YouTube ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/thisisabhishekgoswami/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1.5 text-sm text-text-muted hover:text-text transition-colors"
                >
                  Instagram ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.threads.com/@thisisabhishekgoswami"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1.5 text-sm text-text-muted hover:text-text transition-colors"
                >
                  Threads ↗
                </a>
              </li>
              <li>
                <a
                  href="https://linktr.ee/thisisabhishekgoswami"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1.5 text-sm text-text-muted hover:text-text transition-colors"
                >
                  Linktree ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-text-dim">
            &copy; {new Date().getFullYear()} {SITE_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}
