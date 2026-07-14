import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/site/navbar'
import { PromoBar } from '@/components/site/promo-bar'
import { Footer } from '@/components/site/footer'
import { WhatsappFloat } from '@/components/site/whatsapp-float'
import { BackToTop } from '@/components/site/back-to-top'
import type { Category } from '@/types/database'

export const revalidate = 300

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('store_categories').select('*').order('sort_order', { ascending: true })

  return (
    <div className="flex min-h-screen flex-col">
      <PromoBar />
      <Navbar categories={(categories as Category[]) ?? []} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsappFloat />
      <BackToTop />
    </div>
  )
}
