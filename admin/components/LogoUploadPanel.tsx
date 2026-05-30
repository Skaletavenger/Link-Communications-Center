'use client'

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  bumpLogoVersion,
  checkStoredLogo,
  deleteBrandLogo,
  getBrandLogoDisplayUrl,
  uploadBrandLogo,
} from '../lib/brandLogo'

type Props = {
  onToast: (message: string) => void
}

export default function LogoUploadPanel({ onToast }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hasStoredLogo, setHasStoredLogo] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [checking, setChecking] = useState(true)

  const loadPreview = useCallback(async () => {
    setChecking(true)
    const exists = await checkStoredLogo(supabase)

    if (!exists) {
      setPreviewUrl(null)
      setHasStoredLogo(false)
      setChecking(false)
      return
    }

    setPreviewUrl(getBrandLogoDisplayUrl(supabase))
    setHasStoredLogo(true)
    setChecking(false)
  }, [])

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
      const { error } = await uploadBrandLogo(supabase, selected)
      setUploading(false)
      e.target.value = ''

      if (error) {
        onToast(`Upload failed: ${error.message}`)
        return
      }

      bumpLogoVersion()
      onToast('Logo updated successfully!')
      setFile(null)
      await loadPreview()
      return
    }

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleUpload = async () => {
    if (!file) {
      onToast('Choose a logo image first.')
      return
    }

    setUploading(true)
    const { error } = await uploadBrandLogo(supabase, file)
    setUploading(false)

    if (error) {
      onToast(`Upload failed: ${error.message}`)
      return
    }

    bumpLogoVersion()
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onToast('Logo uploaded successfully!')
    await loadPreview()
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to remove the logo? The navbar will fall back to the default icon and text.'
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await deleteBrandLogo(supabase)
    setDeleting(false)

    if (error) {
      onToast(`Delete failed: ${error.message}`)
      return
    }

    bumpLogoVersion()
    setPreviewUrl(null)
    setHasStoredLogo(false)
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onToast('Logo removed successfully!')
  }

  return (
    <div
      className="rounded-2xl border p-6"
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

      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Logo
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Upload your full business logo (icon + name). It appears in the navbar on both admin and user sites.
          </p>

          <div
            className="rounded-xl border flex items-center justify-center min-h-[120px] p-4 mb-4"
            style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
          >
            {checking ? (
              <div className="h-10 w-40 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={previewUrl}
                src={previewUrl}
                alt="Logo preview"
                className="max-h-16 w-auto max-w-full object-contain"
              />
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No logo uploaded yet — default brand mark is shown.
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
                Stored at <code className="font-mono">brand-assets/logo/logo</code>
              </p>
            </>
          )}

          {!hasStoredLogo && !checking && (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 text-sm text-left px-4 py-3 rounded-xl border transition-all hover:opacity-80"
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
      </div>
    </div>
  )
}
