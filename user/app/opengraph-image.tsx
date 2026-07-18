import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Link Communications Center — CCTV, Networking, Phones & Loans in Kampala'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0d3a5c 0%, #1574B5 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 2, opacity: 0.85, textTransform: 'uppercase' }}>
          Link Communications Center
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginTop: 24 }}>
          CCTV · Networking · Phones · Loans
        </div>
        <div style={{ fontSize: 34, marginTop: 28, opacity: 0.9 }}>
          Kampala, Uganda · Pay with MTN MoMo &amp; Airtel Money
        </div>
      </div>
    ),
    { ...size }
  )
}
