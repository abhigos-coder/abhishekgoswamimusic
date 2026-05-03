import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getRazorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const { courseId, email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    // Fetch course
    const { data: course, error: courseError } = await getSupabaseAdmin()
      .from('courses')
      .select('id, title, price')
      .eq('id', courseId)
      .eq('is_published', true)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already purchased with this email
    const { data: existingPurchase } = await getSupabaseAdmin()
      .from('purchases')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .eq('course_id', courseId)
      .eq('status', 'completed')
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'This course has already been purchased with this email address' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await getRazorpay().orders.create({
      amount: course.price,
      currency: 'INR',
      notes: {
        courseId: course.id,
        email: email.trim().toLowerCase(),
      },
    });

    // Create pending purchase record with access token
    await getSupabaseAdmin().from('purchases').insert({
      user_id: null,
      course_id: courseId,
      email: email.trim().toLowerCase(),
      razorpay_order_id: order.id,
      amount: course.price,
      status: 'pending',
      access_token: crypto.randomUUID(),
    });

    return NextResponse.json({
      orderId: order.id,
      amount: course.price,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
