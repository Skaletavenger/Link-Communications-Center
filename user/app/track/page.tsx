import type { Metadata } from 'next'
import TrackClient from './TrackClient'

export const metadata: Metadata = {
  title: 'Track Your Order | Link Communications Center',
  description: 'Check the status of your order, delivery progress and pickup readiness at Link Communications Center, Kampala.',
  alternates: { canonical: 'https://linkcommunicationscenter.com/track' },
}

export default function TrackPage() {
  return <TrackClient />
}
