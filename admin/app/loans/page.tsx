"use client"
import AdminGuard from '../../lib/AdminGuard'

import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2 } from 'lucide-react'

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

type LoanForm = {
  brand: string
  model: string
  storage_variant: string
  device_price: number | string
  daily_deposit: number | string
  daily_amount: number | string
  monthly_deposit: number | string
  monthly_amount: number | string
  image_url: string
  is_available: boolean
}

const INITIAL_FORM: LoanForm = {
  brand: '',
  model: '',
  storage_variant: '',
  device_price: 0,
  daily_deposit: 0,
  daily_amount: 0,
  monthly_deposit: 0,
  monthly_amount: 0,
  image_url: '',
  is_available: true,
}

function formatUGX(value?: number | string) {
  const amount = Number(value ?? 0) || 0
  return `UGX ${amount.toLocaleString()}`
}

function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [form, setForm] = useState<LoanForm>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchLoans()
  }, [])

  async function fetchLoans() {
    setLoading(true)
    const { data, error } = await supabase.from('loans').select('*').order('brand', { ascending: true })
    if (error) {
      console.error('fetch loans error', error)
    }
    setLoans((data || []) as Loan[])
    setLoading(false)
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const ext = file.name.split('.').pop()
    const fileName = `loan-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('brand-assets').upload(fileName, file, { upsert: true })

    if (!error && data) {
      const { data: urlData } = supabase.storage.from('brand-assets').getPublicUrl(data.path)
      setForm(prev => ({ ...prev, image_url: urlData.publicUrl }))
    }

    setUploadingImage(false)
  }

  async function saveLoan(e: FormEvent) {
    e.preventDefault()

    const payload = {
      brand: form.brand,
      model: form.model,
      storage_variant: form.storage_variant || null,
      device_price: Number(form.device_price) || 0,
      daily_deposit: Number(form.daily_deposit) || 0,
      daily_amount: Number(form.daily_amount) || 0,
      monthly_deposit: Number(form.monthly_deposit) || 0,
      monthly_amount: Number(form.monthly_amount) || 0,
      image_url: form.image_url || null,
      is_available: form.is_available,
    }

    if (editingLoan) {
      await supabase.from('loans').update(payload).eq('id', editingLoan.id)
    } else {
      await supabase.from('loans').insert([payload])
    }

    setShowForm(false)
    setEditingLoan(null)
    setForm(INITIAL_FORM)
    fetchLoans()
  }

  async function deleteLoan(id: number) {
    if (!confirm('Delete this loan product?')) return
    await supabase.from('loans').delete().eq('id', id)
    fetchLoans()
  }

  function openEdit(loan: Loan) {
    setEditingLoan(loan)
    setForm({
      brand: loan.brand,
      model: loan.model,
      storage_variant: loan.storage_variant || '',
      device_price: loan.device_price,
      daily_deposit: loan.daily_deposit ?? 0,
      daily_amount: loan.daily_amount ?? 0,
      monthly_deposit: loan.monthly_deposit ?? 0,
      monthly_amount: loan.monthly_amount ?? 0,
      image_url: loan.image_url || '',
      is_available: loan.is_available ?? true,
    })
    setShowForm(true)
  }

  function openNewLoan() {
    setEditingLoan(null)
    setForm(INITIAL_FORM)
    setShowForm(true)
  }

  function removeImage() {
    setForm(prev => ({ ...prev, image_url: '' }))
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Loan Products</h1>
            <p className="mt-2 text-sm text-slate-500">Manage loan products and inventory.</p>
          </div>

          <button
            type="button"
            onClick={openNewLoan}
            className="rounded-xl bg-[#1574B5] px-5 py-3 text-white font-semibold hover:bg-[#125d8f] transition"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-2xl bg-white shadow-sm border border-slate-200" />
            ))}
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-900">No loan products yet</p>
            <p className="mt-3 text-sm text-slate-500">Use the Add Product button to create the first loan.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loans.map(loan => (
              <div key={loan.id} className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="h-52 bg-slate-100 flex items-center justify-center p-3">
                  {loan.image_url ? (
                    <img src={loan.image_url} alt={`${loan.brand} ${loan.model}`} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-200 text-slate-500">No image</div>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{loan.brand} {loan.model}</h2>
                      {loan.storage_variant ? <p className="text-sm text-slate-500">{loan.storage_variant}</p> : null}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${loan.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {loan.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-slate-900">{formatUGX(loan.device_price)}</p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                      <p className="font-semibold">Daily Plan</p>
                      <p className="mt-1">Deposit: {formatUGX(loan.daily_deposit)}</p>
                      <p>Amount: {formatUGX(loan.daily_amount)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                      <p className="font-semibold">Monthly Plan</p>
                      <p className="mt-1">Deposit: {formatUGX(loan.monthly_deposit)}</p>
                      <p>Amount: {formatUGX(loan.monthly_amount)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 border-t border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-[#1574B5] px-4 py-3 text-white font-semibold hover:bg-[#125d8f] transition"
                    onClick={() => openEdit(loan)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLoan(loan.id)}
                    className="mt-3 w-full rounded-xl bg-[#ED2124] px-4 py-3 text-white font-semibold hover:bg-[#c20f1d] transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#1574B5]">Loan Product</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{editingLoan ? 'Edit Loan Product' : 'Add Loan Product'}</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-900">Cancel</button>
            </div>

            <form onSubmit={saveLoan} className="mt-6 grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Brand</span>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => setForm(prev => ({ ...prev, brand: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Model</span>
                  <input
                    type="text"
                    value={form.model}
                    onChange={e => setForm(prev => ({ ...prev, model: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Storage Variant</span>
                  <input
                    type="text"
                    value={form.storage_variant}
                    onChange={e => setForm(prev => ({ ...prev, storage_variant: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Device Price UGX</span>
                  <input
                    type="number"
                    value={form.device_price}
                    onChange={e => setForm(prev => ({ ...prev, device_price: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    min={0}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Daily Deposit UGX</span>
                  <input
                    type="number"
                    value={form.daily_deposit}
                    onChange={e => setForm(prev => ({ ...prev, daily_deposit: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    min={0}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Daily Amount UGX</span>
                  <input
                    type="number"
                    value={form.daily_amount}
                    onChange={e => setForm(prev => ({ ...prev, daily_amount: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    min={0}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Monthly Deposit UGX</span>
                  <input
                    type="number"
                    value={form.monthly_deposit}
                    onChange={e => setForm(prev => ({ ...prev, monthly_deposit: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    min={0}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Monthly Amount UGX</span>
                  <input
                    type="number"
                    value={form.monthly_amount}
                    onChange={e => setForm(prev => ({ ...prev, monthly_amount: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
                    min={0}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2 items-center">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Image</span>
                  <div className="mt-2 flex items-center gap-4">
                    {form.image_url ? (
                      <div className="relative">
                        <img src={form.image_url} alt="Loan product" className="h-32 w-32 rounded-xl object-contain bg-slate-100 p-2" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute right-0 top-0 rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">No image</div>
                    )}
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2 block w-full text-sm text-slate-700"
                  />
                  {uploadingImage && <p className="mt-2 text-xs text-slate-500">Uploading...</p>}
                </label>
              </div>

              <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={e => setForm(prev => ({ ...prev, is_available: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-[#1574B5]"
                />
                Available
              </label>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-2xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" className="rounded-2xl bg-[#1574B5] px-5 py-3 text-white font-semibold hover:bg-[#125d8f] transition">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function LoansPageProtected() {
  return (
    <AdminGuard>
      <LoansPage />
    </AdminGuard>
  )
}
