import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are Link, a friendly AI shopping assistant for Link Communications Center, a tech store in Kampala Uganda that sells surveillance cameras, access control systems, and communication equipment. Be helpful, warm, and concise.`

type RequestBody = {
  message?: string
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json()
    const message = body.message?.trim()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key is not configured' }, { status: 500 })
    }

    const prompt = `${SYSTEM_PROMPT}\n\nHuman: ${message}\n\nAssistant:`
    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        prompt,
        max_tokens_to_sample: 300,
        temperature: 0.7,
        stop_sequences: ['\n\nHuman:'],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Anthropic request failed' },
        { status: response.status }
      )
    }

    const reply = String(data.completion || '').trim()
    return NextResponse.json({ reply })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
