import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
      <p className="label-mono mb-4">Legal</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-8">Refund &amp; Cancellation Policy</h1>

      <div className="space-y-8 text-sm text-text-muted leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-text mb-3">No Refunds</h2>
          <p>
            All sales on Abhishek Goswami Music are <strong className="text-text">final</strong>.
            Due to the digital nature of our products (online video courses), we do not offer
            refunds or cancellations once a purchase has been completed.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">Before You Purchase</h2>
          <p>We encourage you to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Read the full course description on the course page</li>
            <li>Review the curriculum outline to understand what is covered</li>
            <li>Watch the free preview videos available for each course</li>
            <li>Contact us with any questions before making a purchase</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">What You Get</h2>
          <p>
            Upon successful payment, you receive <strong className="text-text">lifetime access</strong> to
            all video lessons in the purchased course. You can watch the content as many times
            as you like, at your own pace, from any browser.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">Lost Access?</h2>
          <p>
            If you lose access to your purchased courses (e.g., cleared browser cookies, new
            device), you can restore it anytime using our{' '}
            <a href="/recover-access" className="text-primary hover:text-primary-hover">access recovery</a>{' '}
            feature. No need to repurchase.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">Technical Issues</h2>
          <p>
            If you experience technical issues preventing you from accessing purchased content,
            please{' '}
            <a href="/about#contact" className="text-primary hover:text-primary-hover">contact us</a>{' '}
            and we will resolve the issue promptly.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-text mb-3">Contact</h2>
          <p>
            For any questions regarding this policy, contact our Grievance Officer:
          </p>
          <div className="mt-3 p-4 border border-border rounded-lg">
            <p className="text-text font-medium">Abhishek Goswami</p>
            <p>Email: <a href="mailto:abgo4u@gmail.com" className="text-primary hover:text-primary-hover">abgo4u@gmail.com</a></p>
          </div>
        </section>

        <p className="text-xs text-text-dim pt-4 border-t border-border">
          Last updated: April 2026
        </p>
      </div>
    </div>
  );
}
