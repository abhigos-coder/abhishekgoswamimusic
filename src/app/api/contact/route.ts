import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().from('contact_messages').insert({
      name,
      email,
      message,
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // Send email notification (awaited so serverless runtimes don't kill the process)
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
          to: process.env.GMAIL_USER,
          subject: `New message from ${name}`,
          text: `From: ${name} <${email}>\n\n${message}`,
          replyTo: email,
        });
      } catch (err) {
        console.error('Failed to send contact email notification:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
