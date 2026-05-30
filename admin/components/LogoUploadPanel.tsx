'use client'

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BRAND_LOGO_PATHS,
  bumpLogoVersion,
  checkStoredLogo,
  deleteBrandLogo,
  getBrandLogoDisplayUrl,
  LogoVariant,
  uploadBrandLogo,
} from '../lib/brandLogo'

type Props = {
  onToast: (message: string) => void
}

type SinglePanelProps = {
  variant: LogoVariant
  label: string
  subtitle: string
  previewBackground: string
  onToast: (message: string) => void
}

function SingleLogoPanel({
  variant,
  label,
  subtitle,
  previewBackground,
  onToast,
}: SinglePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hasStoredLogo, setHasStoredLogo] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [checking, setChecking] = useState(true)

  const loadPreview = useCallback(async () => {
    setChecking(true)
    const exists = await checkStoredLogo(supabase, variant)

    if (!exists) {
      setPreviewUrl(null)
      setHasStoredLogo(false)
      setChecking(false)
      return
    }

    setPreviewUrl(getBrandLogoDisplayUrl(supabase, variant))
    setHasStoredLogo(true)
    setChecking(false)
  }, [variant])

  useEffect(() => {
    loadPreview()
  }, [loadPreview])

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      onToast('Please select an image file.')
      return
    }

    if (hasStoredLogo) {
      setUploading(true)
      const { error } = await uploadBrandLogo(supabase, selected, variant)
      setUploading(false)
      e.target.value = ''

      if (error) {
        onToast(`${label}: upload failed — ${error.message}`)
        return
      }

      bumpLogoVersion(variant)
      onToast(`${label} updated successfully!`)
      setFile(null)
      await loadPreview()
      return
    }

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleUpload = async () => {
    if (!file) {
      onToast(`Choose a ${label.toLowerCase()} image first.`)
      return
    }

    setUploading(true)
    const { error } = await uploadBrandLogo(supabase, file, variant)
    setUploading(false)

    if (error) {
      onToast(`${label}: upload failed — ${error.message}`)
      return
    }

    bumpLogoVersion(variant)
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onToast(`${label} uploaded successfully!`)
    await loadPreview()
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Remove the ${label.toLowerCase()}? The navbar will use the other mode logo or fall back to the default icon and text.`
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await deleteBrandLogo(supabase, variant)
    setDeleting(false)

    if (error) {
      onToast(`${label}: delete failed — ${error.message}`)
      return
    }

    bumpLogoVersion(variant)
    setPreviewUrl(null)
    setHasStoredLogo(false)
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onToast(`${label} removed successfully!`)
  }

  return (
    <div
      className="rounded-2xl border p-6 h-full"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {label}
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        {subtitle}
      </p>

      <div
        className="rounded-xl border flex items-center justify-center min-h-[120px] p-4 mb-4"
        style={{ background: previewBackground, borderColor: 'var(--border-color)' }}
      >
        {checking ? (
          <div className="h-10 w-40 rounded-lg animate-pulse opacity-40" style={{ background: 'var(--bg-card)' }} />
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={previewUrl}
            src={previewUrl}
            alt={`${label} preview`}
            className="max-h-16 w-auto max-w-full object-contain"
          />
        ) : (
          <p className="text-sm text-center px-2" style={{ color: 'var(--text-muted)' }}>
            No {label.toLowerCase()} uploaded yet.
          </p>
        )}
      </div>

      {hasStoredLogo && !checking && (
        <>
          <div className="flex flex-wrap gap-3 mb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || deleting}
              className="px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1574B5' }}
            >
              {uploading ? 'Updating...' : 'Edit / Replace'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={uploading || deleting}
              className="px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#ED2124' }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Stored at <code className="font-mono">brand-assets/{BRAND_LOGO_PATHS[variant]}</code>
          </p>
        </>
      )}

      {!hasStoredLogo && !checking && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-left px-4 py-3 rounded-xl border transition-all hover:opacity-80"
            style={{
              background: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {file ? file.name : 'Choose image file...'}
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !file}
            className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#1574B5' }}
          >
            {uploading ? 'Uploading...' : 'Upload Logo'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function LogoUploadPanel({ onToast }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Upload separate logos for light and dark mode. Each appears in the navbar when that theme is active.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SingleLogoPanel
          variant="light"
          label="Light Mode Logo"
          subtitle="Displayed when site is in light mode"
          previewBackground="#ffffff"
          onToast={onToast}
        />
        <SingleLogoPanel
          variant="dark"
          label="Dark Mode Logo"
          subtitle="Displayed when site is in dark mode"
          previewBackground="#0f172a"
          onToast={onToast}
        />
      </div>
    </div>
  )
}
