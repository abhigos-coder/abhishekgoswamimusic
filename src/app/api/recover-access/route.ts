import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const HMAC_PREFIX = 'recover-access:';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for completed purchases with this email
    const { data: purchases } = await getSupabaseAdmin()
      .from('purchases')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('status', 'completed')
      .limit(1);

    if (!purchases || purchases.length === 0) {
      return NextResponse.json(
        { error: 'No purchases found for this email' },
        { status: 404 }
      );
    }

    // Generate HMAC token: base64url(email:timestamp).signature
    // Domain-separated with "recover-access:" prefix to avoid key reuse collision with Razorpay
    const timestamp = Date.now().toString();
    const payload = `${normalizedEmail}:${timestamp}`;
    const payloadB64 = Buffer.from(payload).toString('base64url');
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(HMAC_PREFIX + payload)
      .digest('hex');
    const token = `${payloadB64}.${signature}`;

    const origin = new URL(request.url).origin;
    const recoveryLink = `${origin}/api/recover-access/verify?token=${token}`;

    // Send recovery email (awaited for serverless reliability)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: normalizedEmail,
          subject: 'Recover your course access — Abhishek Goswami Music',
          text: `Hi,\n\nClick the link below to restore access to your purchased courses on this device:\n\n${recoveryLink}\n\nThis link expires in 30 minutes.\n\nIf you did not request this, you can safely ignore this email.\n\n— Abhishek Goswami Music`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
              <h2 style="margin-bottom: 16px;">Recover Your Course Access</h2>
              <p>Click the button below to restore access to your purchased courses on this device:</p>
              <p style="margin: 24px 0;">
                <a href="${recoveryLink}" style="display: inline-block; padding: 12px 24px; background-color: #5e8aff; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Restore Access
                </a>
              </p>
              <p style="font-size: 13px; color: #666;">This link expires in 30 minutes.</p>
              <p style="font-size: 13px; color: #666;">If you did not request this, you can safely ignore this email.</p>
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #999;">Abhishek Goswami Music</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Failed to send recovery email:', err);
        return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
