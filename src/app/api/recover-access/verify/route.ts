import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const HMAC_PREFIX = 'recover-access:';

export async function GET(request: Request) {
  const appUrl = new URL(request.url).origin;

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${appUrl}/recover-access?error=missing-token`);
    }

    // Split token into payload and signature
    const dotIndex = token.lastIndexOf('.');
    if (dotIndex === -1) {
      return NextResponse.redirect(`${appUrl}/recover-access?error=invalid-token`);
    }

    const payloadB64 = token.substring(0, dotIndex);
    const providedSignature = token.substring(dotIndex + 1);

    // Decode payload
    let payload: string;
    try {
      payload = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    } catch {
      return NextResponse.redirect(`${appUrl}/recover-access?error=invalid-token`);
    }

    const colonIndex = payload.lastIndexOf(':');
    if (colonIndex === -1) {
      return NextResponse.redirect(`${appUrl}/recover-access?error=invalid-token`);
    }

    const email = payload.substring(0, colonIndex);
    const timestamp = parseInt(payload.substring(colonIndex + 1), 10);

    if (!email || isNaN(timestamp)) {
      return NextResponse.redirect(`${appUrl}/recover-access?error=invalid-token`);
    }

    // Check expiration first (before signature check to avoid timing oracle on expired tokens)
    if (Date.now() - timestamp > TOKEN_EXPIRY_MS) {
      return NextResponse.redirect(`${appUrl}/recover-access?error=expired`);
    }

    // Verify HMAC signature using timing-safe comparison
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(HMAC_PREFIX + payload)
      .digest('hex');

    const expected = Buffer.from(expectedSignature, 'hex');
    const provided = Buffer.from(providedSignature, 'hex');

    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
      return NextResponse.redirect(`${appUrl}/recover-access?error=invalid-token`);
    }

    // Fetch all completed purchases for this email
    const { data: purchases } = await getSupabaseAdmin()
      .from('purchases')
      .select('access_token, course_id')
      .eq('email', email)
      .eq('status', 'completed');

    if (!purchases || purchases.length === 0) {
      return NextResponse.redirect(`${appUrl}/recover-access?error=no-purchases`);
    }

    // Redirect to success page and set all purchase cookies
    const response = NextResponse.redirect(`${appUrl}/recover-access/success`);

    for (const purchase of purchases) {
      response.cookies.set(`purchase_access_${purchase.course_id}`, purchase.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('Recovery verification error:', error);
    return NextResponse.redirect(`${appUrl}/recover-access?error=server-error`);
  }
}
