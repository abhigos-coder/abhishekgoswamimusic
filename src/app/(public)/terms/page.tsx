import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
      <p className="label-mono mb-4">Legal</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-8">Terms &amp; Conditions</h1>

      <div className="space-y-8 text-sm text-text-muted leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-text mb-3">1. Overview</h2>
          <p>
            These Terms &amp; Conditions govern your use of the Abhishek Goswami Music website
            and the purchase of digital courses offered through it. By accessing this website
            or making a purchase, you agree to be bound by these terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">2. Products &amp; Services</h2>
          <p>
            We offer digital video courses on jazz and fingerstyle guitar. All course content
            is delivered online through our website. Courses consist of pre-recorded video
            lessons hosted on YouTube (unlisted). Upon purchase, you receive lifetime access
            to the course content.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">3. Account &amp; Access</h2>
          <p>
            No user account is required to purchase a course. You provide your email address
            and phone number during checkout. Access to purchased courses is granted via a
            secure browser cookie. If you lose access (e.g., by clearing cookies or switching
            devices), you can recover it using the email-based recovery flow on our website.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">4. Payments</h2>
          <p>
            All payments are processed securely through Razorpay. We accept UPI, credit/debit
            cards, and netbanking. Prices are listed in Indian Rupees (INR). Payment is required
            in full before access to course content is granted.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">5. Refund Policy</h2>
          <p>
            All sales are final. Due to the digital nature of our products, we do not offer
            refunds or cancellations once a purchase is completed. Please review the course
            description and preview videos carefully before purchasing. For details, see
            our <a href="/refund-policy" className="text-primary hover:text-primary-hover">Refund Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">6. Intellectual Property</h2>
          <p>
            All course content, including videos, text, and graphics, is the intellectual
            property of Abhishek Goswami Music. You may not reproduce, distribute, or share
            any course content without prior written permission. Your purchase grants you a
            personal, non-transferable license to view the content for your own learning.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">7. Limitation of Liability</h2>
          <p>
            Abhishek Goswami Music provides course content on an &ldquo;as is&rdquo; basis. We do not
            guarantee specific learning outcomes. Our liability is limited to the amount paid
            for the course in question.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">8. Privacy</h2>
          <p>
            Your personal information is handled in accordance with our{' '}
            <a href="/privacy" className="text-primary hover:text-primary-hover">Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">9. Grievance Officer</h2>
          <p>
            If you have any complaints or concerns regarding the content or services, you may
            contact our Grievance Officer:
          </p>
          <div className="mt-3 p-4 border border-border rounded-lg">
            <p className="text-text font-medium">Abhishek Goswami</p>
            <p>Email: <a href="mailto:abgo4u@gmail.com" className="text-primary hover:text-primary-hover">abgo4u@gmail.com</a></p>
       
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">10. Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Changes will be posted on
            this page. Continued use of the website after changes constitutes acceptance of the
            revised terms.
          </p>
        </section>

        <p className="text-xs text-text-dim pt-4 border-t border-border">
          Last updated: April 2026
        </p>
      </div>
    </div>
  );
}
