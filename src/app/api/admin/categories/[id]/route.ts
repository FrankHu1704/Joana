import { NextRequest } from 'next/server'
import { authenticateAdmin } from '@/lib/api-session'
import { jsonError, jsonOk } from '@/lib/api-response'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const { error } = await auth.supabase.from('store_categories').delete().eq('id', id)
  if (error) return jsonError('Não foi possível eliminar a categoria', 500)
  return jsonOk({ deleted: true })
}
