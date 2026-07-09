// Shared Pesapal API v3 helper.
// Docs: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference
//
// Env vars required (set in Vercel):
//   PESAPAL_CONSUMER_KEY
//   PESAPAL_CONSUMER_SECRET
// Optional:
//   PESAPAL_BASE_URL   defaults to the sandbox ("demo") environment.
//                       Switch to https://pay.pesapal.com/v3 once you move to a live merchant account.
//   PESAPAL_IPN_ID      if you've already registered an IPN URL in the Pesapal dashboard and want to
//                       reuse it instead of re-registering on every order (optional, purely an optimization).

const PESAPAL_BASE_URL = process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3'

type PesapalTokenResponse = {
  token: string
  expiryDate: string
  error: unknown
  status: string
  message: string
}

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getPesapalAccessToken(): Promise<string> {
  // Reuse a cached token if it's still valid for at least another 30s.
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token
  }

  const consumerKey = process.env.PESAPAL_CONSUMER_KEY
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error('Pesapal credentials not configured (PESAPAL_CONSUMER_KEY / PESAPAL_CONSUMER_SECRET missing)')
  }

  const res = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  })

  const rawText = await res.text()
  let data: PesapalTokenResponse & { error?: { code?: string; message?: string } | string }
  try {
    data = JSON.parse(rawText)
  } catch {
    throw new Error(`Pesapal token request returned non-JSON response (HTTP ${res.status}): ${rawText.slice(0, 300)}`)
  }

  // Log the full response server-side so it shows up in Vercel logs for debugging,
  // without exposing the raw body to the browser.
  console.error('Pesapal RequestToken response:', JSON.stringify(data))

  if (!res.ok || !data.token) {
    const errorDetail =
      typeof data.error === 'string'
        ? data.error
        : data.error?.message || data.error?.code || data.message || `HTTP ${res.status} with no error detail in body`
    throw new Error(`Pesapal token request failed: ${errorDetail}`)
  }

  // Pesapal tokens are valid for 5 minutes; cache for 4 to stay safe.
  cachedToken = { token: data.token, expiresAt: Date.now() + 4 * 60 * 1000 }
  return data.token
}

export async function registerPesapalIPN(notificationUrl: string): Promise<string> {
  // If an IPN was already registered and pinned via env var, just reuse it.
  if (process.env.PESAPAL_IPN_ID) {
    return process.env.PESAPAL_IPN_ID
  }

  const token = await getPesapalAccessToken()

  const res = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: notificationUrl,
      ipn_notification_type: 'GET',
    }),
  })

  const data = await res.json()

  if (!res.ok || !data.ipn_id) {
    throw new Error(`Pesapal IPN registration failed: ${data.message || res.statusText}`)
  }

  return data.ipn_id as string
}

export type PesapalSubmitOrderParams = {
  id: string
  amount: number
  currency: string
  description: string
  callbackUrl: string
  notificationId: string
  phoneNumber?: string
  email?: string
  firstName?: string
  lastName?: string
}

export async function submitPesapalOrder(params: PesapalSubmitOrderParams) {
  const token = await getPesapalAccessToken()

  const res = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: params.id,
      currency: params.currency,
      amount: params.amount,
      description: params.description,
      callback_url: params.callbackUrl,
      notification_id: params.notificationId,
      billing_address: {
        email_address: params.email || 'customer@linkcommunicationscenter.com',
        phone_number: params.phoneNumber || '',
        first_name: params.firstName || 'Customer',
        last_name: params.lastName || 'LCC',
        country_code: 'UG',
      },
    }),
  })

  const data = await res.json()

  if (!res.ok || data.error) {
    throw new Error(`Pesapal order submission failed: ${data.error?.message || data.message || res.statusText}`)
  }

  return data as {
    order_tracking_id: string
    merchant_reference: string
    redirect_url: string
    error: unknown
    status: string
  }
}

export async function getPesapalTransactionStatus(orderTrackingId: string) {
  const token = await getPesapalAccessToken()

  const res = await fetch(
    `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(`Pesapal status check failed: ${data.message || res.statusText}`)
  }

  return data as {
    payment_method: string
    amount: number
    created_date: string
    confirmation_code: string
    payment_status_description: string // "Completed" | "Failed" | "Invalid" | "Pending" | "Reversed"
    description: string
    message: string
    payment_account: string
    call_back_url: string
    status_code: number // 1 = Completed, 2 = Failed, 0 = Invalid, 3 = Reversed
    merchant_reference: string
    payment_status_code: string
    currency: string
    error: unknown
    status: string
  }
}
