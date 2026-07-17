import { createClient } from '@supabase/supabase-js'

// Public client config. The URL and anon key are intentionally safe to ship
// to the browser (they are in every client bundle); RLS policies protect data.
// The hardcoded fallbacks keep builds working even if Vercel env vars are
// missing or misconfigured.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://coyrlfrwjbhidlxjlzxc.supabase.co'
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNveXJsZnJ3amJoaWRseGpsenhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTYzMjMsImV4cCI6MjA5NTQ3MjMyM30.wsovqT3d5n_7Aq8wm_dZsC5eOGrB_R9hgRRJktVduJ0'

export const supabase = createClient(supabaseUrl, supabaseKey)
