import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const query = typeof body?.query === 'string' ? body.query.trim() : ''
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      return NextResponse.json({ error: 'Missing Unsplash access key (set UNSPLASH_ACCESS_KEY or NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)' }, { status: 500 })
    }
    console.log('Using Unsplash access key from', process.env.UNSPLASH_ACCESS_KEY ? 'UNSPLASH_ACCESS_KEY' : 'NEXT_PUBLIC_UNSPLASH_ACCESS_KEY')

    const params = new URLSearchParams({
      query,
      per_page: '12',
      client_id: accessKey
    })

    const url = `https://api.unsplash.com/search/photos?${params.toString()}`
    console.log('Unsplash API URL:', url)

    const response = await fetch(url, { method: 'GET' })
    const text = await response.text()
    console.log('Unsplash raw response:', text)

    if (!response.ok) {
      return NextResponse.json({ error: `Unsplash request failed: ${response.status} ${response.statusText}`, body: text }, { status: response.status })
    }

    const data = JSON.parse(text)
    if (!data || !Array.isArray(data.results)) {
      return NextResponse.json({ error: 'Unexpected Unsplash response format', body: data }, { status: 502 })
    }

    const imageUrls = data.results
      .map((item: any) => item?.urls?.regular)
      .filter((url: unknown) => typeof url === 'string' && url.trim().length > 0)
      .slice(0, 12)

    return NextResponse.json(imageUrls)
  } catch (error) {
    console.error('Unsplash search route error:', error)
    return NextResponse.json({ error: 'Unsplash search failed' }, { status: 500 })
  }
}
