import { BookOpen, Users, CreditCard, MessageSquare } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { formatPrice } from '@/types/database';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const [
    { count: courseCount },
    { data: purchases },
    { count: messageCount },
  ] = await Promise.all([
    getSupabaseAdmin().from('courses').select('*', { count: 'exact', head: true }),
    getSupabaseAdmin().from('purchases').select('amount, email').eq('status', 'completed'),
    getSupabaseAdmin()
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false),
  ]);

  const totalRevenue = purchases?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const uniqueStudents = new Set(purchases?.map((p) => p.email).filter(Boolean)).size;

  const stats = [
    { label: 'Courses', value: courseCount ?? 0, icon: BookOpen },
    { label: 'Students', value: uniqueStudents, icon: Users },
    { label: 'Revenue', value: formatPrice(totalRevenue), icon: CreditCard },
    { label: 'Unread', value: messageCount ?? 0, icon: MessageSquare },
  ];

  return (
    <div>
      <p className="label-mono mb-4">Overview</p>
      <h1 className="text-2xl font-bold text-text mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-text-muted">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-text">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
