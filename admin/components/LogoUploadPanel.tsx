'use client'

import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getBrandLogoPublicUrl, uploadBrandLogo } from '../lib/brandLogo'

type Props = {
  onToast: (message: string) => void
}

export default function LogoUploadPanel({ onToast }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hasLogo, setHasLogo] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [checking, setChecking] = useState(true)

  const loadPreview = useCallback(() => {
    const url = getBrandLogoPublicUrl(supabase)
    const img = new window.Image()
    img.onload = () => {
      setPreviewUrl(url)
      setHasLogo(true)
      setChecking(false)
    }
    img.onerror = () => {
      setPreviewUrl(null)
      setHasLogo(false)
      setChecking(false)
    }
    img.src = `${url}?t=${Date.now()}`
  }, [])

  useEffect(() => {
    loadPreview()
  }, [loadPreview])

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      onToast('Please select an image file.')
      return
    }
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setHasLogo(true)
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

    setFile(null)
    onToast('Logo uploaded successfully!')
    loadPreview()
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
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
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

          {hasLogo && !checking && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Stored at <code className="font-mono">brand-assets/logo/logo</code>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 min-w-[240px]">
          <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Logo image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:px-4 file:py-2 file:font-semibold file:text-white file:cursor-pointer"
            style={{ color: 'var(--text-primary)' }}
          />
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
      </div>
    </div>
  )
}
