import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await getSupabaseAdmin()
        .from('purchases')
        .update({ status: 'failed', razorpay_payment_id, razorpay_signature })
        .eq('razorpay_order_id', razorpay_order_id);

      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update purchase as completed and fetch the access token
    const { data: purchase, error } = await getSupabaseAdmin()
      .from('purchases')
      .update({ status: 'completed', razorpay_payment_id, razorpay_signature })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('access_token, course_id')
      .single();

    if (error || !purchase) {
      console.error('Update purchase error:', error);
      return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });

    // Set a per-course httpOnly cookie so the watch page can verify access without auth
    // Use course_id from the DB record — never trust the client-supplied value
    response.cookies.set(`purchase_access_${purchase.course_id}`, purchase.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
