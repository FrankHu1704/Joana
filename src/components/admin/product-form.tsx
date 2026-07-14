'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Category, Product } from '@/types/database'

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(String(product?.price ?? ''))
  const [hasPromo, setHasPromo] = useState(product?.is_promotion ?? false)
  const [promoPrice, setPromoPrice] = useState(product?.promo_price != null ? String(product.promo_price) : '')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [images, setImages] = useState<string[]>(product?.images?.length ? product.images : [''])
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false)
  const [isNew, setIsNew] = useState(product?.is_new ?? false)
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const cleanImages = images.map((i) => i.trim()).filter(Boolean)
    if (cleanImages.length === 0) {
      toast({ title: 'Adicione pelo menos uma imagem', variant: 'error' })
      return
    }

    setLoading(true)
    const payload = {
      name,
      description,
      price: Number(price),
      promo_price: hasPromo && promoPrice ? Number(promoPrice) : null,
      category_id: categoryId || null,
      images: cleanImages,
      is_promotion: hasPromo,
      is_featured: isFeatured,
      is_new: isNew,
      is_active: isActive,
    }

    const res = await fetch(isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)

    if (!res.ok) {
      toast({ title: 'Erro ao guardar produto', variant: 'error' })
      return
    }

    toast({ title: isEdit ? 'Produto actualizado' : 'Produto criado', variant: 'success' })
    router.push('/admin/produtos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-preto-suave">Nome</label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-preto-suave">Descrição</label>
          <Textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-preto-suave">Preço (MT)</label>
          <Input required type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-preto-suave">Categoria</label>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-preto-suave">Imagens (URLs)</label>
        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={img}
                onChange={(e) => setImages((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} disabled={images.length === 1}>
                <Trash2 size={15} />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setImages((prev) => [...prev, ''])}>
          <Plus size={14} /> Adicionar imagem
        </Button>
      </div>

      <div className="flex flex-wrap gap-6 rounded-2xl border border-dourado-claro/25 p-4 dark:border-preto-suave/50">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={hasPromo} onChange={(e) => setHasPromo(e.target.checked)} className="accent-rosa-profundo" /> Em promoção
        </label>
        {hasPromo && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-preto-suave">Preço promocional:</span>
            <Input type="number" step="0.01" min="0" className="w-32" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-dourado" /> Destaque
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="accent-emerald-600" /> Novidade
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-preto" /> Activo (visível na loja)
        </label>
      </div>

      <Button type="submit" variant="primary" loading={loading}>
        <Save size={16} /> {isEdit ? 'Guardar alterações' : 'Criar produto'}
      </Button>
    </form>
  )
}
