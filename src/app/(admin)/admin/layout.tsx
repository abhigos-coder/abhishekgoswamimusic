import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 pt-14 lg:pt-8 lg:p-8 overflow-auto">{children}</div>
    </div>
  );
}
