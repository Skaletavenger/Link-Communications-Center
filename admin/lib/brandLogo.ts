import type { SupabaseClient } from '@supabase/supabase-js'

export const BRAND_LOGO_BUCKET = 'brand-assets'
export const BRAND_LOGO_PATH = 'logo/logo'

export function getBrandLogoPublicUrl(supabase: SupabaseClient) {
  const { data } = supabase.storage.from(BRAND_LOGO_BUCKET).getPublicUrl(BRAND_LOGO_PATH)
  return data.publicUrl
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
