import { supabase } from './supabase'

// Simple fixed-window rate limiter backed by Supabase (no Redis/third-party
// service needed). Not perfectly precise under heavy concurrency, but more
// than sufficient to stop abuse/spam at this app's scale.
//
// Usage in an API route:
//   const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
//   const { allowed, retryAfterSeconds } = await checkRateLimit(`pesapal:${ip}`, 5, 60)
//   if (!allowed) return NextResponse.json({ error: 'Too many requests, please try again shortly.' }, { status: 429 })

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  try {
    const now = new Date()

    const { data: existing } = await supabase
      .from('rate_limits')
      .select('count, window_start')
      .eq('key', key)
      .maybeSingle()

    if (!existing) {
      await supabase.from('rate_limits').insert({ key, count: 1, window_start: now.toISOString() })
      return { allowed: true, retryAfterSeconds: 0 }
    }

    const windowStart = new Date(existing.window_start)
    const elapsedSeconds = (now.getTime() - windowStart.getTime()) / 1000

    if (elapsedSeconds > windowSeconds) {
      // Window has expired - reset the counter.
      await supabase
        .from('rate_limits')
        .update({ count: 1, window_start: now.toISOString() })
        .eq('key', key)
      return { allowed: true, retryAfterSeconds: 0 }
    }

    if (existing.count >= maxRequests) {
      return { allowed: false, retryAfterSeconds: Math.ceil(windowSeconds - elapsedSeconds) }
    }

    await supabase
      .from('rate_limits')
      .update({ count: existing.count + 1 })
      .eq('key', key)

    return { allowed: true, retryAfterSeconds: 0 }
  } catch (err) {
    // If the rate limit check itself fails (e.g. table missing), fail open
    // rather than blocking real customers over an infra hiccup.
    console.error('Rate limit check failed, allowing request:', err)
    return { allowed: true, retryAfterSeconds: 0 }
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
