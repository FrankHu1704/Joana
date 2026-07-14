'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { phoneToAdminEmail } from '@/lib/admin-identity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const forbidden = searchParams.get('error') === 'forbidden'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: phoneToAdminEmail(phone), password })

    if (signInError) {
      setLoading(false)
      setError('Número ou senha incorrectos.')
      return
    }

    const { data: isAdmin } = await supabase.rpc('store_is_admin')
    setLoading(false)

    if (!isAdmin) {
      await supabase.auth.signOut()
      setError('Esta conta não tem acesso ao painel administrativo.')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-preto px-4">
      <div className="w-full max-w-sm rounded-3xl border border-dourado-claro/20 bg-white/5 p-8 backdrop-blur">
        <div className="flex items-center gap-2 text-creme">
          <ShieldCheck className="text-dourado" size={22} />
          <span className="font-display text-lg font-bold">Painel Joana Store</span>
        </div>
        <p className="mt-2 text-sm text-creme-2/60">Acesso restrito à administração.</p>

        {forbidden && (
          <div className="mt-5 flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> Esta conta não tem permissões de administrador.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-creme-2/60">Número de telefone</label>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="84 000 0000"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-creme/15 bg-white/5 text-creme placeholder:text-creme-2/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-creme-2/60">Senha</label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="border-creme/15 bg-white/5 text-creme placeholder:text-creme-2/30" />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <Button type="submit" variant="gold" className="w-full" loading={loading}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
