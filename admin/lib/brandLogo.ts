import type { SupabaseClient } from '@supabase/supabase-js'

export const BRAND_LOGO_BUCKET = 'brand-assets'

export type LogoVariant = 'light' | 'dark'

export const BRAND_LOGO_PATHS: Record<LogoVariant, string> = {
  light: 'logo/logo-light',
  dark: 'logo/logo-dark',
}

const LOGO_FILE_NAMES: Record<LogoVariant, string> = {
  light: 'logo-light',
  dark: 'logo-dark',
}

export function getLogoVersionKey(variant: LogoVariant) {
  return `lcc_logo_version_${variant}`
}

export function getLogoVersion(variant: LogoVariant): string {
  if (typeof window === 'undefined') return '0'
  return localStorage.getItem(getLogoVersionKey(variant)) || '0'
}

export function bumpLogoVersion(variant: LogoVariant) {
  if (typeof window === 'undefined') return
  localStorage.setItem(getLogoVersionKey(variant), String(Date.now()))
  window.dispatchEvent(new Event('lcc-logo-updated'))
}

export function getBrandLogoPublicUrl(supabase: SupabaseClient, variant: LogoVariant) {
  const { data } = supabase.storage
    .from(BRAND_LOGO_BUCKET)
    .getPublicUrl(BRAND_LOGO_PATHS[variant])
  return data.publicUrl
}

export function getBrandLogoDisplayUrl(supabase: SupabaseClient, variant: LogoVariant) {
  return `${getBrandLogoPublicUrl(supabase, variant)}?v=${getLogoVersion(variant)}`
}

export async function checkStoredLogo(
  supabase: SupabaseClient,
  variant: LogoVariant
): Promise<boolean> {
  const fileName = LOGO_FILE_NAMES[variant]
  const { data, error } = await supabase.storage
    .from(BRAND_LOGO_BUCKET)
    .list('logo', { limit: 20 })

  if (!error && (data ?? []).some((file) => file.name === fileName)) {
    return true
  }

  try {
    const res = await fetch(
      `${getBrandLogoPublicUrl(supabase, variant)}?v=${Date.now()}`,
      { method: 'HEAD' }
    )
    return res.ok
  } catch {
    return false
  }
}

export async function uploadBrandLogo(
  supabase: SupabaseClient,
  file: File,
  variant: LogoVariant
) {
  return supabase.storage.from(BRAND_LOGO_BUCKET).upload(BRAND_LOGO_PATHS[variant], file, {
    upsert: true,
    contentType: file.type || 'image/png',
    cacheControl: '3600',
  })
}

export async function deleteBrandLogo(
  supabase: SupabaseClient,
  variant: LogoVariant
) {
  return supabase.storage.from(BRAND_LOGO_BUCKET).remove([BRAND_LOGO_PATHS[variant]])
}

export function isDarkMode(): boolean {
  if (typeof document === 'undefined') return true
  return document.documentElement.classList.contains('dark')
}

export async function resolveBrandLogoUrl(
  supabase: SupabaseClient
): Promise<string | null> {
  const primary: LogoVariant = isDarkMode() ? 'dark' : 'light'
  const fallback: LogoVariant = primary === 'dark' ? 'light' : 'dark'

  if (await checkStoredLogo(supabase, primary)) {
    return getBrandLogoDisplayUrl(supabase, primary)
  }
  if (await checkStoredLogo(supabase, fallback)) {
    return getBrandLogoDisplayUrl(supabase, fallback)
  }
  return null
}
