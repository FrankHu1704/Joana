'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getCategoryIcon } from '@/lib/category-icons'
import type { Category } from '@/types/database'

export default function AdminCategoriasPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch('/api/categories')
    const json = await res.json()
    setCategories(json?.data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, sort_order: categories.length }),
    })
    setLoading(false)
    if (!res.ok) {
      toast({ title: 'Erro ao criar categoria', variant: 'error' })
      return
    }
    toast({ title: 'Categoria criada', variant: 'success' })
    setName('')
    load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    toast({ title: 'Categoria eliminada', variant: 'success' })
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-preto dark:text-creme">Categorias</h1>
        <p className="text-sm text-preto-suave dark:text-creme-2/70">Gira as categorias de produtos.</p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-3 rounded-2xl border border-dourado-claro/25 bg-white p-5 dark:border-preto-suave/60 dark:bg-preto/60">
        <Input placeholder="Nome da categoria" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" required />
        <Button type="submit" variant="primary" loading={loading}>
          <Plus size={16} /> Adicionar
        </Button>
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => {
          const Icon = getCategoryIcon(c.slug)
          return (
            <div key={c.id} className="flex items-center justify-between rounded-2xl border border-dourado-claro/25 bg-white p-4 dark:border-preto-suave/60 dark:bg-preto/60">
              <span className="flex items-center gap-2 font-bold text-preto dark:text-creme">
                <Icon size={18} strokeWidth={2} /> {c.name}
              </span>
              <button onClick={() => handleDelete(c.id)} className="text-preto-suave/50 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
