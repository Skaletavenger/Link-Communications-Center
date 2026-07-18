import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact Link Communications Center, Lions Shopping Center, Namirembe Road, Kampala. Call or WhatsApp +256 757 837184, email linkcomm72@gmail.com. Open Mon–Sat.',
  alternates: { canonical: '/contact' },
}

export default function Page() {
  return <ContactClient />
}
