import { requireAdmin } from '@/lib/auth'
import { AdminShell } from '@/components/admin/shell'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  return <AdminShell fullName={admin.fullName}>{children}</AdminShell>
}
