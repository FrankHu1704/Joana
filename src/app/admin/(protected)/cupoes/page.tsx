'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { Coupon } from '@/types/database'

export default function AdminCupoesPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState({ code: '', discount_percent: '', discount_amount: '', max_uses: '' })
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/coupons')
    const json = await res.json()
    setCoupons(json?.data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        discount_percent: Number(form.discount_percent || 0),
        discount_amount: Number(form.discount_amount || 0),
        max_uses: form.max_uses ? Number(form.max_uses) : undefined,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      toast({ title: 'Erro ao criar cupão (código pode já existir)', variant: 'error' })
      return
    }
    toast({ title: 'Cupão criado', variant: 'success' })
    setForm({ code: '', discount_percent: '', discount_amount: '', max_uses: '' })
    load()
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !c.is_active }),
    })
    load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">Cupões de desconto</h1>
        <p className="text-sm text-preto-suave dark:text-creme-2/70">Crie códigos promocionais para os seus clientes.</p>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60 sm:grid-cols-4">
        <Input placeholder="Código (ex: JOANA10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
        <Input type="number" placeholder="Desconto %" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
        <Input type="number" placeholder="Desconto fixo (MT)" value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: e.target.value })} />
        <Input type="number" placeholder="Limite de usos" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
        <Button type="submit" variant="primary" loading={loading} className="sm:col-span-4">
          <Plus size={16} /> Criar cupão
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dourado-claro/20 text-left text-preto-suave dark:border-preto-suave/50 dark:text-creme-2/60">
              <th className="pb-2 font-bold">Código</th>
              <th className="pb-2 font-bold">Desconto</th>
              <th className="pb-2 font-bold">Usos</th>
              <th className="pb-2 font-bold">Estado</th>
              <th className="pb-2 font-bold">Criado</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-dourado-claro/10 last:border-0 dark:border-preto-suave/30">
                <td className="py-3 font-mono font-bold text-preto dark:text-creme">{c.code}</td>
                <td className="py-3 text-preto-suave dark:text-creme-2/70">
                  {c.discount_percent > 0 && `${c.discount_percent}%`}
                  {c.discount_percent > 0 && c.discount_amount > 0 && ' + '}
                  {c.discount_amount > 0 && `${c.discount_amount} MT`}
                </td>
                <td className="py-3 text-preto-suave dark:text-creme-2/70">
                  {c.used_count}
                  {c.max_uses ? ` / ${c.max_uses}` : ''}
                </td>
                <td className="py-3">
                  <button onClick={() => toggleActive(c)}>
                    <Badge variant={c.is_active ? 'new' : 'outline'}>{c.is_active ? 'Activo' : 'Inactivo'}</Badge>
                  </button>
                </td>
                <td className="py-3 text-preto-suave dark:text-creme-2/70">{formatDate(c.created_at)}</td>
                <td className="py-3">
                  <button onClick={() => handleDelete(c.id)} className="text-preto-suave/50 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
