"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Loan = {
  id: number
  brand: string
  model: string
  storage_variant?: string
  device_price: number
  daily_deposit: number
  daily_amount: number
  monthly_deposit: number
  monthly_amount: number
  image_url?: string
  is_available: boolean
}

function formatUGX(value?: number | string) {
  const amount = Number(value ?? 0) || 0
  return `UGX ${amount.toLocaleString()}`
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])

  useEffect(() => {
    fetchLoans()
  }, [])

  async function fetchLoans() {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('is_available', true)
      .order('brand', { ascending: true })

    if (error) {
      console.error('fetch loans error', error)
      return
    }

    setLoans((data || []) as Loan[])
  }

  const groupedLoans = loans.reduce<Record<string, Loan[]>>((acc, loan) => {
    (acc[loan.brand] ||= []).push(loan)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Loan Products</h1>
            <p className="mt-2 text-sm text-slate-500">Browse available loan products and apply through contact.</p>
          </div>
        </div>

        {Object.keys(groupedLoans).length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-900">No available loans right now</p>
            <p className="mt-2 text-sm text-slate-500">Check back later or contact us for updates.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedLoans).map(([brand, brandLoans]) => (
              <section key={brand} className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">{brand}</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {brandLoans.map(loan => (
                    <div key={loan.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <div className="h-52 bg-slate-100 flex items-center justify-center p-3">
                        {loan.image_url ? (
                          <img
                            src={loan.image_url}
                            alt={`${loan.brand} ${loan.model}`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-slate-200 text-slate-500">No image</div>
                        )}
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">{loan.model}</h3>
                          {loan.storage_variant ? <p className="text-sm text-slate-500">{loan.storage_variant}</p> : null}
                        </div>

                        <div className="text-2xl font-bold text-slate-900">{formatUGX(loan.device_price)}</div>

                        <div className="space-y-3 text-sm text-slate-600">
                          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                            <p className="font-semibold">Daily plan</p>
                            <p className="mt-1">Deposit: {formatUGX(loan.daily_deposit)}</p>
                            <p>Amount: {formatUGX(loan.daily_amount)}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                            <p className="font-semibold">Monthly plan</p>
                            <p className="mt-1">Deposit: {formatUGX(loan.monthly_deposit)}</p>
                            <p>Amount: {formatUGX(loan.monthly_amount)}</p>
                          </div>
                        </div>

                        <a
                          href="/contact"
                          className="block rounded-2xl bg-[#1574B5] px-4 py-3 text-center text-white font-semibold hover:bg-[#125d8f] transition"
                        >
                          Apply for this loan
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
