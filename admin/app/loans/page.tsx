"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

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
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>({ brand: '', model: '', device_price: '' })

  useEffect(() => {
    fetchLoans()
  }, [])

  async function fetchLoans() {
    setLoading(true)
    const { data, error } = await supabase.from('loans').select('*').order('created_at', { ascending: false })
    if (error) console.error('fetch loans error', error)
    setLoans((data || []) as Loan[])
    setLoading(false)
  }

  async function createLoan(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      brand: form.brand,
      model: form.model,
      storage_variant: form.storage_variant || null,
      device_price: Number(form.device_price) || 0,
      daily_deposit: form.daily_deposit ? Number(form.daily_deposit) : null,
      daily_amount: form.daily_amount ? Number(form.daily_amount) : null,
      monthly_deposit: form.monthly_deposit ? Number(form.monthly_deposit) : null,
      monthly_amount: form.monthly_amount ? Number(form.monthly_amount) : null,
      image_url: form.image_url || null,
      is_available: form.is_available !== undefined ? form.is_available : true,
    }
    const { error } = await supabase.from('loans').insert(payload)
    if (error) {
      alert('Create failed')
      console.error(error)
      return
    }
    setForm({ brand: '', model: '', device_price: '' })
    fetchLoans()
  }

  async function toggleAvailable(id: number, current: boolean|undefined) {
    await supabase.from('loans').update({ is_available: !current }).eq('id', id)
    fetchLoans()
  }

  async function removeLoan(id: number) {
    if (!confirm('Delete this loan record?')) return
    await supabase.from('loans').delete().eq('id', id)
    fetchLoans()
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Smartphone Loans (Admin)</h1>

      <form onSubmit={createLoan} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input value={form.brand || ''} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Brand" className="input" />
        <input value={form.model || ''} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Model" className="input" />
        <input value={form.storage_variant || ''} onChange={e => setForm({ ...form, storage_variant: e.target.value })} placeholder="Storage (eg. 4GB/64GB)" className="input" />
        <input value={form.device_price || ''} onChange={e => setForm({ ...form, device_price: e.target.value })} placeholder="Device Price" className="input" />
        <input value={form.daily_deposit || ''} onChange={e => setForm({ ...form, daily_deposit: e.target.value })} placeholder="Daily deposit" className="input" />
        <input value={form.daily_amount || ''} onChange={e => setForm({ ...form, daily_amount: e.target.value })} placeholder="Daily amount" className="input" />
        <input value={form.monthly_deposit || ''} onChange={e => setForm({ ...form, monthly_deposit: e.target.value })} placeholder="Monthly deposit" className="input" />
        <input value={form.monthly_amount || ''} onChange={e => setForm({ ...form, monthly_amount: e.target.value })} placeholder="Monthly amount" className="input" />
        <input value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL" className="input" />

        <div className="md:col-span-3 flex items-center gap-3">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add Loan</button>
          <button type="button" onClick={() => { setForm({}) }} className="px-3 py-2 border rounded">Reset</button>
        </div>
      </form>

      <div>
        <h2 className="text-lg font-semibold mb-3">Records</h2>
        {loading ? <div>Loading…</div> : (
          <div className="grid gap-3">
            {loans.map(l => (
              <div key={l.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{l.brand} — {l.model} {l.storage_variant ? ` (${l.storage_variant})` : ''}</div>
                  <div className="text-sm text-muted">Price: {l.device_price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleAvailable(l.id, l.is_available)} className="px-3 py-1 border rounded">
                    {l.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <button onClick={() => removeLoan(l.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
