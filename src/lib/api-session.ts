import { createClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/api-response'

/** Authenticates a dashboard (cookie-session) request as a Joana Store admin. */
export async function authenticateAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: jsonError('Não autenticado', 401) }

  const { data: isAdmin } = await supabase.rpc('store_is_admin')
  if (!isAdmin) return { error: jsonError('Acesso restrito a administradores', 403) }

  return { supabase, userId: user.id }
}
