'use client'
import AdminGuard from '../../lib/AdminGuard'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Mail, Trash2, RefreshCw, Check, Inbox } from 'lucide-react'

type Message = {
  id: string
  name: string | null
  email: string | null
  message: string | null
  read: boolean | null
  created_at: string
}

function ContactInbox() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    setMessages((data || []) as Message[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const markRead = useCallback(async (m: Message, read: boolean) => {
    setBusyId(m.id)
    const { error } = await supabase.from('contact_messages').update({ read }).eq('id', m.id)
    if (error) setError(error.message)
    else setMessages(prev => prev.map(x => (x.id === m.id ? { ...x, read } : x)))
    setBusyId(null)
  }, [])

  const remove = useCallback(async (m: Message) => {
    if (!window.confirm(`Delete this message from ${m.name || m.email || 'customer'}? This cannot be undone.`)) return
    setBusyId(m.id)
    const { error } = await supabase.from('contact_messages').delete().eq('id', m.id)
    if (error) setError(error.message)
    else setMessages(prev => prev.filter(x => x.id !== m.id))
    setBusyId(null)
  }, [])

  const unread = useMemo(() => messages.filter(m => !m.read).length, [messages])
  const shown = useMemo(() => (filter === 'unread' ? messages.filter(m => !m.read) : messages), [messages, filter])

  return (
    <main className="min-h-screen bg-primary pt-24 px-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Messages</h1>
            <p className="text-sm text-muted mt-1">Messages customers sent through the Contact page.</p>
          </div>
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: '#1574B5' }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)} className="px-4 py-2 rounded-xl text-sm font-semibold border capitalize transition" style={filter === f ? { background: '#1574B5', color: '#fff', borderColor: 'transparent' } : { background: 'transparent', color: 'var(--text-primary, #111)', borderColor: 'rgba(120,120,120,0.3)' }}>
              {f}{f === 'unread' && unread > 0 ? ` (${unread})` : ''}
            </button>
          ))}
        </div>

        {error && <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700 mb-4">{error}</div>}

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-card border border-theme animate-pulse" />)}</div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl bg-card border border-theme p-12 text-center">
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}><Inbox size={24} /></div>
            <p className="text-lg font-semibold text-primary">{filter === 'unread' ? 'No unread messages' : 'No messages yet'}</p>
            <p className="text-sm text-muted mt-1">Messages customers send from the Contact page will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map(m => {
              const busy = busyId === m.id
              return (
                <div key={m.id} className="rounded-2xl bg-card border p-5" style={{ borderColor: m.read ? 'var(--border-color)' : '#1574B5' }}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!m.read && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#1574B5' }} />}
                        <p className="font-bold text-primary">{m.name || 'Unknown'}</p>
                      </div>
                      {m.email && <a href={`mailto:${m.email}`} className="text-sm break-all" style={{ color: '#1574B5' }}>{m.email}</a>}
                    </div>
                    <span className="text-xs text-muted whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-secondary whitespace-pre-wrap">{m.message}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.email && (
                      <a href={`mailto:${m.email}?subject=Re:%20Your%20message%20to%20Link%20Communications%20Center`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: '#1574B5' }}>
                        <Mail size={13} /> Reply
                      </a>
                    )}
                    <button type="button" disabled={busy} onClick={() => markRead(m, !m.read)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:opacity-80 disabled:opacity-50" style={{ color: '#16a34a', borderColor: 'rgba(22,163,74,0.4)' }}>
                      <Check size={13} /> {m.read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button type="button" disabled={busy} onClick={() => remove(m)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:opacity-80 disabled:opacity-50" style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.4)' }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default function ContactProtected() {
  return (
    <AdminGuard>
      <ContactInbox />
    </AdminGuard>
  )
}
