import { getSupabaseAdmin } from '@/lib/supabase/admin';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Site Settings' };

export default async function AdminSettingsPage() {
  const { data: settings, error } = await getSupabaseAdmin()
    .from('site_settings')
    .select('*')
    .single();

  if (error || !settings) {
    return (
      <div className="text-center py-16 bg-surface rounded-xl border border-border">
        <p className="text-text-muted">
          Could not load settings. Make sure the site_settings table exists.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Site Settings</h1>
      <div className="max-w-2xl bg-surface rounded-xl border border-border p-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
