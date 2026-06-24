"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Loan = {
  id: number
  brand: string
  model: string
  storage_variant?: string
  device_price: number
  daily_deposit?: number
  daily_amount?: number
  monthly_deposit?: number
  monthly_amount?: number
  image_url?: string
  is_available?: boolean
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [viewMonthly, setViewMonthly] = useState(false)

  useEffect(() => { fetchLoans() }, [])

  async function fetchLoans() {
    const { data } = await supabase.from('loans').select('*').order('brand', { ascending: true })
    setLoans((data || []) as Loan[])
  }

  const grouped = loans.reduce<Record<string, Loan[]>>((acc, loan) => {
    (acc[loan.brand] ||= []).push(loan)
    return acc
  }, {})

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">Smartphone Loans</h1>
      <p className="mb-6">Choose a plan type: <button className="px-3 py-1 mr-2 border rounded" onClick={() => setViewMonthly(false)}>Daily</button><button className="px-3 py-1 border rounded" onClick={() => setViewMonthly(true)}>Monthly</button></p>

      <div className="space-y-8">
        {Object.keys(grouped).map(brand => (
          <section key={brand}>
            <h2 className="text-2xl font-semibold mb-4">{brand}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {grouped[brand].map(l => (
                <article key={l.id} className="border rounded p-4">
                  <img src={l.image_url || '/favicon.ico'} alt={`${l.brand} ${l.model}`} className="w-full h-40 object-cover mb-3 rounded" />
                  <div className="font-semibold">{l.model} {l.storage_variant}</div>
                  <div className="text-sm text-muted">Price: {l.device_price}</div>
                  <div className="mt-3">
                    {viewMonthly ? (
                      <div>
                        <div className="text-sm">Monthly deposit: {l.monthly_deposit ?? '—'}</div>
                        <div className="text-sm">Monthly amount: {l.monthly_amount ?? '—'}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm">Daily deposit: {l.daily_deposit ?? '—'}</div>
                        <div className="text-sm">Daily amount: {l.daily_amount ?? '—'}</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <a className="inline-block px-4 py-2 bg-blue-600 text-white rounded" href={`/contact?phone=${encodeURIComponent(l.model)}`}>Inquire Now</a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
