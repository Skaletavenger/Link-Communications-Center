import { createClient } from '@supabase/supabase-js'
import type { ProductRow } from './inventory'

// Server-side Supabase client + product fetchers used by server components
// (product pages, sitemap). Read-only via the public anon key.
function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function fetchAllProducts(): Promise<(ProductRow & { created_at?: string })[]> {
  const { data, error } = await serverClient()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('fetchAllProducts failed:', error.message)
    return []
  }
  return (data ?? []) as (ProductRow & { created_at?: string })[]
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function fetchProduct(id: string): Promise<ProductRow | null> {
  if (!UUID_RE.test(id)) return null
  const { data, error } = await serverClient()
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('fetchProduct failed:', error.message)
    return null
  }
  return (data as ProductRow) ?? null
}
