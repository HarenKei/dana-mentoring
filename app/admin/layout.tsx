import { requireAdmin } from '@/lib/auth';
import { AdminNav } from './layout-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav />
      <main>{children}</main>
    </div>
  );
}
