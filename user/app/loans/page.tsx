import type { Metadata } from 'next'
import LoansClient from './LoansClient'

export const metadata: Metadata = {
  title: 'Smartphone Loans',
  description:
    'Apply for a smartphone loan at Link Communications Center, Kampala. Get a phone today and pay in instalments — fast approval, flexible terms.',
  alternates: { canonical: '/loans' },
}

export default function Page() {
  return <LoansClient />
}
