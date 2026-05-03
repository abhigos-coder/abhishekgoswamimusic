import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    await requireAdmin();

    const { data, error } = await getSupabaseAdmin()
      .from('testimonials')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { data, error } = await getSupabaseAdmin()
      .from('testimonials')
      .insert({
        image_url: body.image_url,
        sort_order: body.sort_order,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const { items } = await request.json();

    const supabase = getSupabaseAdmin();

    for (const item of items as { id: string; sort_order: number }[]) {
      const { error } = await supabase
        .from('testimonials')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { id } = await request.json();

    const { error } = await getSupabaseAdmin()
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
