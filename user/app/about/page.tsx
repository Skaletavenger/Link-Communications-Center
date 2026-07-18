import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Link Communications Center is a trusted Kampala provider of CCTV cameras, access control, networking, intercoms, alarms and smartphones, serving homes and businesses across Uganda.',
  alternates: { canonical: '/about' },
}

export default function Page() {
  return <AboutClient />
}
