import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Plain (cookie-less) anon-key client for contexts that don't have access to
 * the request's cookies — e.g. sitemap.ts, which only needs public read
 * access to active products/categories.
 */
export function createAnonServerClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  })
}
