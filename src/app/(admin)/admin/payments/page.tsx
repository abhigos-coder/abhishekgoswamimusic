import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { formatPrice } from '@/types/database';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Payments' };

export default async function AdminPaymentsPage() {
  const { data: purchases } = await getSupabaseAdmin()
    .from('purchases')
    .select('*, profiles(email, full_name), courses(title)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Payments</h1>

      {purchases && purchases.length > 0 ? (
        <div className="bg-surface rounded-xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-surface-light">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Date</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Student</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Course</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Amount</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => {
                const profile = purchase.profiles as { email: string; full_name: string | null } | null;
                const course = purchase.courses as { title: string } | null;
                return (
                  <tr key={purchase.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {new Date(purchase.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-text">{profile?.full_name || 'N/A'}</p>
                      <p className="text-xs text-text-muted">{profile?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-text">{course?.title || 'N/A'}</td>
                    <td className="px-4 py-3 text-text font-medium">
                      {formatPrice(purchase.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          purchase.status === 'completed'
                            ? 'success'
                            : purchase.status === 'failed'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted font-mono">
                      {purchase.razorpay_payment_id || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <p className="text-text-muted">No payments yet.</p>
        </div>
      )}
    </div>
  );
}
