"use client"

import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Phone } from 'lucide-react'

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

const INITIAL_FORM: Partial<Loan> = {
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

function formatUGX(value?: number) {
  if (value == null) return 'UGX 0'
  return `UGX ${Number(value).toLocaleString()}`
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [form, setForm] = useState<Partial<Loan>>(INITIAL_FORM)

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

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const ext = file.name.split('.').pop()
    const fileName = `loan-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)
      setForm(f => ({ ...f, image_url: urlData.publicUrl }))
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
      daily_deposit: form.daily_deposit != null ? Number(form.daily_deposit) : null,
      daily_amount: form.daily_amount != null ? Number(form.daily_amount) : null,
      monthly_deposit: form.monthly_deposit != null ? Number(form.monthly_deposit) : null,
      monthly_amount: form.monthly_amount != null ? Number(form.monthly_amount) : null,
      image_url: form.image_url || null,
      is_available: form.is_available ?? true,
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
    if (!confirm('Delete this loan entry?')) return
    await supabase.from('loans').delete().eq('id', id)
    fetchLoans()
  }

  function openEdit(loan: Loan) {
    setForm({ ...loan })
    setEditingLoan(loan)
    setShowForm(true)
  }

  function openNewLoan() {
    setForm(INITIAL_FORM)
    setEditingLoan(null)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Smartphone Loans
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Full CRUD management for phone loan plans and inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewLoan}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-white font-semibold transition-all"
            style={{ background: 'var(--color-primary)' }}
          >
            <Plus size={16} /> Add New Phone
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6" />
            ))}
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
            <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              No loans added yet.
            </p>
            <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
              Click &ldquo;Add New Phone&rdquo; to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loans.map(loan => (
              <div key={loan.id} className="rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
                <div className="relative h-48 bg-slate-100">
                  {loan.image_url ? (
                    <img
                      src={loan.image_url}
                      alt={`${loan.brand} ${loan.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Phone size={48} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {loan.brand} {loan.model}
                      </h2>
                      {loan.storage_variant && (
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                          {loan.storage_variant}
                        </p>
                      )}
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: loan.is_available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        color: loan.is_available ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {loan.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {formatUGX(loan.device_price)}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="rounded-2xl bg-[var(--bg-primary)] p-4 border" style={{ borderColor: 'var(--border)' }}>
                      <p className="font-semibold">Daily Plan</p>
                      <p className="mt-1">Deposit: {loan.daily_deposit != null ? formatUGX(loan.daily_deposit) : 'N/A'}</p>
                      <p>Amount: {loan.daily_amount != null ? formatUGX(loan.daily_amount) : 'N/A'}</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--bg-primary)] p-4 border" style={{ borderColor: 'var(--border)' }}>
                      <p className="font-semibold">Monthly Plan</p>
                      <p className="mt-1">Deposit: {loan.monthly_deposit != null ? formatUGX(loan.monthly_deposit) : 'N/A'}</p>
                      <p>Amount: {loan.monthly_amount != null ? formatUGX(loan.monthly_amount) : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-4" style={{ background: 'var(--bg-primary)' }}>
                  <button
                    type="button"
                    onClick={() => openEdit(loan)}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all"
                    style={{ background: 'rgba(21,116,181,0.12)', color: 'var(--color-primary)' }}
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLoan(loan.id)}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white"
                    style={{ background: '#dc2626' }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {editingLoan ? 'Edit Loan' : 'Add New Loan'}
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Add or update a loan entry with pricing and availability.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingLoan(null); setForm(INITIAL_FORM) }}
                className="text-xl text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={saveLoan} className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Brand
                </label>
                <input
                  type="text"
                  required
                  value={form.brand || ''}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Model
                </label>
                <input
                  type="text"
                  required
                  value={form.model || ''}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Storage Variant
                </label>
                <input
                  type="text"
                  placeholder="e.g. 64GB"
                  value={form.storage_variant || ''}
                  onChange={e => setForm(f => ({ ...f, storage_variant: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Device Price UGX
                </label>
                <input
                  type="number"
                  value={form.device_price ?? 0}
                  onChange={e => setForm(f => ({ ...f, device_price: Number(e.target.value) }))}
                  className="w-full rounded-xl px-4 py-3 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Daily Deposit UGX
                </label>
                <input
                  type="number"
                  value={form.daily_deposit ?? 0}
                  onChange={e => setForm(f => ({ ...f, daily_deposit: Number(e.target.value) }))}
                  className="w-full rounded-xl px-4 py-3 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Daily Amount UGX
                </label>
                <input
                  type="number"
                  value={form.daily_amount ?? 0}
                  onChange={e => setForm(f => ({ ...f, daily_amount: Number(e.target.value) }))}
                  className="w-full rounded-xl px-4 py-3 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Monthly Deposit UGX
                </label>
                <input
                  type="number"
                  value={form.monthly_deposit ?? 0}
                  onChange={e => setForm(f => ({ ...f, monthly_deposit: Number(e.target.value) }))}
                  className="w-full rounded-xl px-4 py-3 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Monthly Amount UGX
                </label>
                <input
                  type="number"
                  value={form.monthly_amount ?? 0}
                  onChange={e => setForm(f => ({ ...f, monthly_amount: Number(e.target.value) }))}
                  className="w-full rounded-xl px-4 py-3 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.is_available ?? true}
                    onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                    className="h-5 w-5 rounded border"
                    style={{ borderColor: 'var(--border)' }}
                  />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Available
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Phone Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-xl px-4 py-3 border cursor-pointer"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
                {uploadingImage && <p className="text-sm mt-1 text-blue-400">Uploading...</p>}
                {form.image_url && (
                  <div className="mt-3 relative w-32 h-32">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl border"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingLoan(null); setForm(INITIAL_FORM) }}
                  className="rounded-2xl px-6 py-3 border font-semibold"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl px-6 py-3 font-semibold text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Save Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
