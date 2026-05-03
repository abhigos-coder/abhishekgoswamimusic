'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm') as string;

    if (password !== confirm) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Password updated! You can now sign in.');
    router.push('/admin/login');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="password"
        name="password"
        type="password"
        label="New Password"
        placeholder="At least 6 characters"
        required
        minLength={6}
      />
      <Input
        id="confirm"
        name="confirm"
        type="password"
        label="Confirm Password"
        placeholder="Re-enter your password"
        required
        minLength={6}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full px-5 py-3 bg-primary text-background text-sm font-medium rounded hover:bg-primary-hover transition-colors disabled:opacity-40"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
