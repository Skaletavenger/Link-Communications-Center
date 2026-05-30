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

export function bumpLogoVersion() {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOGO_VERSION_KEY, String(Date.now()))
  window.dispatchEvent(new Event('lcc-logo-updated'))
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

  // Fallback when list is restricted but the public URL is readable
  try {
    const res = await fetch(`${getBrandLogoPublicUrl(supabase)}?v=${Date.now()}`, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

export async function uploadBrandLogo(
  supabase: SupabaseClient,
  file: File
) {
  return supabase.storage.from(BRAND_LOGO_BUCKET).upload(BRAND_LOGO_PATH, file, {
    upsert: true,
    contentType: file.type || 'image/png',
    cacheControl: '3600',
  })
}

export async function deleteBrandLogo(supabase: SupabaseClient) {
  return supabase.storage.from(BRAND_LOGO_BUCKET).remove([BRAND_LOGO_PATH])
}
