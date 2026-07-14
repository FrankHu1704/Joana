import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface AdminSession {
  userId: string
  email: string
  fullName: string
}

/** For use in Server Components/pages under /admin — redirects to /admin/login if not an authenticated store admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: isAdmin } = await supabase.rpc('store_is_admin')
  if (!isAdmin) redirect('/admin/login?error=forbidden')

  const { data: admin } = await supabase.from('store_admins').select('full_name').eq('user_id', user.id).maybeSingle()

  return { userId: user.id, email: user.email ?? '', fullName: admin?.full_name || 'Joana' }
}
