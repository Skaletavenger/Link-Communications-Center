// Delivery pricing config. Zones act as distance tiers; Express is the urgency
// surcharge. Edit these numbers any time - checkout reads them directly.

export type DeliveryZone = {
  id: string
  label: string
  fee: number
  expressAllowed: boolean
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'cbd', label: 'Kampala CBD / City centre', fee: 5000, expressAllowed: true },
  { id: 'greater_kampala', label: 'Greater Kampala (Nakawa, Makindye, Rubaga, Kawempe)', fee: 8000, expressAllowed: true },
  { id: 'wakiso_entebbe_mukono', label: 'Wakiso / Entebbe / Mukono', fee: 15000, expressAllowed: false },
  { id: 'upcountry', label: 'Upcountry (bus courier)', fee: 20000, expressAllowed: false },
]

export const EXPRESS_SURCHARGE = 10000
export const FREE_DELIVERY_THRESHOLD = 1000000

export function zoneById(id?: string | null): DeliveryZone | undefined {
  return DELIVERY_ZONES.find(z => z.id === id)
}

export function computeDeliveryFee(opts: {
  method: 'pickup' | 'delivery'
  zoneId?: string | null
  express?: boolean
  subtotal: number
}): number {
  if (opts.method === 'pickup') return 0
  const zone = zoneById(opts.zoneId)
  if (!zone) return 0
  const base = opts.subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : zone.fee
  const express = opts.express && zone.expressAllowed ? EXPRESS_SURCHARGE : 0
  return base + express
}
