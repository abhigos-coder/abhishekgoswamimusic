'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { formatPrice } from '@/types/database';
import GuestCheckoutModal from '@/components/courses/GuestCheckoutModal';

interface Props {
  courseId: string;
  courseTitle: string;
  price: number;
  slug: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function BuyButton({ courseId, courseTitle, price, slug }: Props) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleBuy = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create order');
      }

      const { orderId, amount, currency } = await res.json();

      setShowModal(false);

      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment gateway is still loading. Please try again in a moment.');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'Abhishek Goswami',
        description: courseTitle,
        order_id: orderId,
        prefill: { email },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              toast.success('Payment successful!');
              // Small delay to ensure the access cookie from verify response is persisted
              await new Promise((resolve) => setTimeout(resolve, 500));
              router.push(`/purchase/success?course=${slug}`);
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch {
            toast.error('Payment verification failed. Please contact support if amount was deducted.');
          }
        },
        theme: {
          color: '#5e8aff',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {showModal && (
        <GuestCheckoutModal
          courseTitle={courseTitle}
          onConfirm={handleBuy}
          onClose={() => setShowModal(false)}
          loading={loading}
        />
      )}

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full px-5 py-3 bg-primary text-background text-base font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-40"
      >
        {loading ? 'Processing…' : `Buy Now — ${formatPrice(price)}`}
      </button>
    </>
  );
}
