import type { SupabaseClient } from '@supabase/supabase-js'

export const BRAND_LOGO_BUCKET = 'brand-assets'
export const BRAND_LOGO_PATH = 'logo/logo'

export function getBrandLogoPublicUrl(supabase: SupabaseClient) {
  const { data } = supabase.storage.from(BRAND_LOGO_BUCKET).getPublicUrl(BRAND_LOGO_PATH)
  return data.publicUrl
}
