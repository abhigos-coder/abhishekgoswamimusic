import { getSupabaseAdmin } from '@/lib/supabase/admin';
import MessageList from '@/components/admin/MessageList';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Messages' };

export default async function AdminMessagesPage() {
  const { data: messages } = await getSupabaseAdmin()
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Contact Messages</h1>
      <MessageList initialMessages={messages ?? []} />
    </div>
  );
}
