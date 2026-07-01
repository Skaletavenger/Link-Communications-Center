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
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [applicationPlan, setApplicationPlan] = useState<'daily' | 'monthly'>('daily')
  const [applicantName, setApplicantName] = useState('')
  const [applicantPhone, setApplicantPhone] = useState('+256')
  const [applicantNin, setApplicantNin] = useState('')
  const [applicationDuration, setApplicationDuration] = useState(1)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => { fetchLoans(); }, [])

  async function fetchLoans() {
    const { data } = await supabase.from('loans').select('*').order('brand', { ascending: true })
    setLoans((data || []) as Loan[])
  }

  function formatUGX(value?: number) {
    if (value == null) return 'UGX 0'
    return `UGX ${Number(value).toLocaleString()}`
  }

  function openApplication(loan: Loan) {
    setSelectedLoan(loan)
    setApplicationPlan('daily')
    setApplicantName('')
    setApplicantPhone('+256')
    setApplicantNin('')
    setApplicationDuration(1)
    setSuccessMessage('')
    setApplicationOpen(true)
  }

  function closeApplication() {
    setApplicationOpen(false)
    setSelectedLoan(null)
  }

  function clampDuration(value: number) {
    const max = applicationPlan === 'daily' ? 365 : 36
    return Math.max(1, Math.min(value || 1, max))
  }

  const grouped = loans.reduce<Record<string, Loan[]>>((acc, loan) => {
    (acc[loan.brand] ||= []).push(loan)
    return acc
  }, {})

  async function submitApplication() {
    if (!selectedLoan) return
    const currentAmount = applicationPlan === 'daily' ? selectedLoan.daily_amount : selectedLoan.monthly_amount
    const totalRepayment = Number(currentAmount || 0) * applicationDuration
    const payload = {
      loan_id: selectedLoan.id,
      plan_type: applicationPlan,
      full_name: applicantName,
      phone: applicantPhone,
      nin: applicantNin || null,
      duration: applicationDuration,
      total_repayment: totalRepayment,
    }
    const { error } = await supabase.from('loan_applications').insert([payload])
    if (error) {
      console.error('submit application error', error)
      return
    }

    setApplicationOpen(false)
    setSelectedLoan(null)
    setSuccessMessage(`Application submitted! We'll contact you on ${applicantPhone} within 24 hours.`)
    window.setTimeout(() => setSuccessMessage(''), 5000)
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">Smartphone Loans</h1>
      {successMessage ? (
        <div className="rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-900 p-4 mb-6">
          {successMessage}
        </div>
      ) : null}
      <p className="mb-6">Choose a plan type: <button className={`px-3 py-1 mr-2 rounded ${!viewMonthly ? 'border bg-[#1574B5] text-white' : 'border bg-white text-[#1574B5]'}`} onClick={() => setViewMonthly(false)}>Daily</button><button className={`px-3 py-1 rounded ${viewMonthly ? 'border bg-[#1574B5] text-white' : 'border bg-white text-[#1574B5]'}`} onClick={() => setViewMonthly(true)}>Monthly</button></p>

      <div className="space-y-8">
        {Object.keys(grouped).map(brand => (
          <section key={brand}>
            <h2 className="text-2xl font-semibold mb-4">{brand}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {grouped[brand].map(l => (
                <article key={l.id} className="border rounded p-4 flex flex-col">
                  <img src={l.image_url || '/favicon.ico'} alt={`${l.brand} ${l.model}`} className="w-full h-40 object-cover mb-3 rounded" />
                  <div className="font-semibold">{l.model} {l.storage_variant}</div>
                  <div className="text-sm text-muted">Price: {formatUGX(l.device_price)}</div>
                  <div className="mt-3">
                    {viewMonthly ? (
                      <div>
                        <div className="text-sm">Monthly deposit: {l.monthly_deposit != null ? formatUGX(l.monthly_deposit) : '—'}</div>
                        <div className="text-sm">Monthly amount: {l.monthly_amount != null ? formatUGX(l.monthly_amount) : '—'}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm">Daily deposit: {l.daily_deposit != null ? formatUGX(l.daily_deposit) : '—'}</div>
                        <div className="text-sm">Daily amount: {l.daily_amount != null ? formatUGX(l.daily_amount) : '—'}</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex-1 flex items-end">
                    <button
                      type="button"
                      className="w-full rounded-xl bg-[#1574B5] px-4 py-3 text-white font-semibold hover:bg-[#125d8f] transition"
                      onClick={() => openApplication(l)}
                    >
                      Apply for this loan
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {applicationOpen && selectedLoan ? (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={closeApplication} />
      ) : null}

      {applicationOpen && selectedLoan ? (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full justify-end">
          <div className="w-full max-w-[400px] bg-white shadow-2xl overflow-y-auto h-full">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#1574B5]">Loan application</p>
                <h2 className="text-2xl font-bold mt-2">{selectedLoan.brand} {selectedLoan.model}</h2>
              </div>
              <button type="button" onClick={closeApplication} className="text-xl text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="rounded-3xl overflow-hidden border border-slate-200">
                <img src={selectedLoan.image_url || '/favicon.ico'} alt={`${selectedLoan.brand} ${selectedLoan.model}`} className="w-full h-56 object-cover" />
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-xl font-semibold">{formatUGX(selectedLoan.device_price)}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Plan</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`rounded-2xl border p-4 cursor-pointer ${applicationPlan === 'daily' ? 'border-[#1574B5] bg-[#ebf5ff]' : 'border-slate-300 bg-white'}`}>
                    <input
                      type="radio"
                      name="plan"
                      value="daily"
                      checked={applicationPlan === 'daily'}
                      onChange={() => setApplicationPlan('daily')}
                      className="mr-2"
                    />
                    Daily plan
                  </label>
                  <label className={`rounded-2xl border p-4 cursor-pointer ${applicationPlan === 'monthly' ? 'border-[#1574B5] bg-[#ebf5ff]' : 'border-slate-300 bg-white'}`}>
                    <input
                      type="radio"
                      name="plan"
                      value="monthly"
                      checked={applicationPlan === 'monthly'}
                      onChange={() => setApplicationPlan('monthly')}
                      className="mr-2"
                    />
                    Monthly plan
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Deposit</p>
                  <p className="font-semibold">{applicationPlan === 'daily' ? formatUGX(selectedLoan.daily_deposit) : formatUGX(selectedLoan.monthly_deposit)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-semibold">{applicationPlan === 'daily' ? formatUGX(selectedLoan.daily_amount) : formatUGX(selectedLoan.monthly_amount)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full name</label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-3"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone number</label>
                  <input
                    type="tel"
                    value={applicantPhone}
                    onChange={e => setApplicantPhone(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-3"
                    placeholder="+2567XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">NIN / ID number</label>
                  <input
                    type="text"
                    value={applicantNin}
                    onChange={e => setApplicantNin(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-3"
                    placeholder="Enter NIN or ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Duration ({applicationPlan === 'daily' ? 'days' : 'months'})</label>
                  <input
                    type="number"
                    min={1}
                    max={applicationPlan === 'daily' ? 365 : 36}
                    value={applicationDuration}
                    onChange={e => setApplicationDuration(clampDuration(Number(e.target.value)))}
                    className="w-full rounded-2xl border px-4 py-3"
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                <p className="text-sm text-slate-500">Total repayment</p>
                <p className="text-xl font-semibold mt-2">{formatUGX((applicationPlan === 'daily' ? selectedLoan.daily_amount : selectedLoan.monthly_amount) * applicationDuration)}</p>
              </div>

              <button
                type="button"
                className="w-full rounded-2xl bg-[#1574B5] px-4 py-3 text-white font-semibold hover:bg-[#125d8f] transition"
                onClick={submitApplication}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
