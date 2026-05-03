import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
      <p className="label-mono mb-4">Legal</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-8">Privacy Policy</h1>

      <div className="space-y-8 text-sm text-text-muted leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-text mb-3">1. Information We Collect</h2>
          <p>When you purchase a course or contact us, we collect:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong className="text-text">Email address</strong> — provided during checkout or contact form</li>
            <li><strong className="text-text">Phone number</strong> — provided during checkout</li>
            <li><strong className="text-text">Name</strong> — provided via the contact form</li>
            <li><strong className="text-text">Payment information</strong> — processed securely by Razorpay (we do not store card details)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">2. How We Use Your Information</h2>
          <p>Your information is used for:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Processing and recording your purchase</li>
            <li>Providing access to purchased course content</li>
            <li>Sending recovery emails when you request access restoration</li>
            <li>Responding to your messages and support requests</li>
          </ul>
          <p className="mt-2">
            We do not use your information for marketing or promotional purposes unless you
            explicitly opt in.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">3. Cookies</h2>
          <p>
            We use httpOnly cookies to manage access to purchased courses. These cookies contain
            a unique access token linked to your purchase and are essential for the site to
            function. They are set upon successful payment and are valid for one year. No
            third-party tracking cookies are used.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong className="text-text">Razorpay</strong> — for secure payment processing (<a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">Razorpay Privacy Policy</a>)</li>
            <li><strong className="text-text">Supabase</strong> — for database hosting and authentication</li>
            <li><strong className="text-text">YouTube</strong> — for video content delivery (privacy-enhanced mode)</li>
            <li><strong className="text-text">Gmail</strong> — for sending transactional emails (recovery links, contact notifications)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">5. Data Security</h2>
          <p>
            We take reasonable measures to protect your personal information. Payment processing
            is handled entirely by Razorpay, and we do not store your card or bank details.
            Access tokens are stored as httpOnly secure cookies to prevent client-side access.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">6. Data Retention</h2>
          <p>
            Purchase records (email, phone, transaction details) are retained indefinitely to
            support lifetime access to courses and for accounting purposes. Contact messages
            are retained until deleted by the administrator.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">7. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data by
            contacting us. Please note that deleting purchase records may affect your ability
            to recover course access in the future.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">8. Grievance Officer</h2>
          <p>
            For any privacy-related concerns or complaints, contact our Grievance Officer:
          </p>
          <div className="mt-3 p-4 border border-border rounded-lg">
            <p className="text-text font-medium">Abhishek Goswami</p>
            <p>Email: <a href="mailto:abgo4u@gmail.com" className="text-primary hover:text-primary-hover">abgo4u@gmail.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page. Continued use of the website after changes constitutes acceptance of the
            revised policy.
          </p>
        </section>

        <p className="text-xs text-text-dim pt-4 border-t border-border">
          Last updated: April 2026
        </p>
      </div>
    </div>
  );
}
