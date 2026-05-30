import type { SupabaseClient } from '@supabase/supabase-js'

export const BRAND_LOGO_BUCKET = 'brand-assets'
export const BRAND_LOGO_PATH = 'logo/logo'
export const LOGO_VERSION_KEY = 'lcc_logo_version'

export function getBrandLogoPublicUrl(supabase: SupabaseClient) {
  const { data } = supabase.storage.from(BRAND_LOGO_BUCKET).getPublicUrl(BRAND_LOGO_PATH)
  return data.publicUrl
}

export function getLogoVersion(): string {
  if (typeof window === 'undefined') return '0'
  return localStorage.getItem(LOGO_VERSION_KEY) || '0'
}

export function getBrandLogoDisplayUrl(supabase: SupabaseClient) {
  return `${getBrandLogoPublicUrl(supabase)}?v=${getLogoVersion()}`
}

export async function checkStoredLogo(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.storage
    .from(BRAND_LOGO_BUCKET)
    .list('logo', { limit: 10 })

  if (!error && (data ?? []).some((file) => file.name === 'logo')) {
    return true
  }

  try {
    const res = await fetch(`${getBrandLogoPublicUrl(supabase)}?v=${Date.now()}`, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}
