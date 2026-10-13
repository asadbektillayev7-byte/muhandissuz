'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  validateArticleImage,
  resizeAndConvertToWebp,
  uploadToArticleImagesBucket,
} from '@/lib/upload'

interface ImageUploadFieldProps {
  label: string
  helperText?: string
  value: string
  onChange: (url: string) => void
  variant?: 'cover' | 'og'
  onUploadStateChange?: (uploading: boolean) => void
}

export function ImageUploadField({
  label,
  helperText,
  value,
  onChange,
  variant = 'cover',
  onUploadStateChange,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { onUploadStateChange?.(uploading) }, [uploading, onUploadStateChange])

  const handleFile = async (file?: File) => {
    if (!file) return
    setError('')
    setPreviewError(false)

    // 1. Validate file (JPG, PNG, WebP only; max 5 MB)
    const validationError = validateArticleImage(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    try {
      // 2. Client-side resize and convert to WebP
      const webpBlob = await resizeAndConvertToWebp(file, variant)

      // 3. Upload to article-images bucket
      const supabase = createClient()
      const { url } = await uploadToArticleImagesBucket(supabase, webpBlob, file.name)

      onChange(url)
    } catch (err: any) {
      setError(err?.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!uploading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onChange('')
    setError('')
    setPreviewError(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium">{label}</label>
        {helperText && (
          <span className="text-xs text-muted-foreground">{helperText}</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
        disabled={uploading}
      />

      {value ? (
        <div
          className={`border border-border p-3 space-y-3 transition-colors ${
            isDragging ? 'border-chart-2 bg-muted/40' : 'bg-transparent'
          }`}
          style={{ borderRadius: 'var(--radius)' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Preview display */}
          <div
            className="relative overflow-hidden bg-muted/50 flex items-center justify-center border border-border"
            style={{
              borderRadius: 'calc(var(--radius) - 2px)',
              maxHeight: '260px',
              minHeight: '140px',
            }}
          >
            {previewError ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Preview unavailable (image could not be loaded)
              </div>
            ) : (
              <img
                src={value}
                alt={label}
                onError={() => setPreviewError(true)}
                className="w-full h-auto max-h-[260px] object-contain"
              />
            )}

            {uploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                  Optimizing and uploading...
                </div>
              </div>
            )}
          </div>

          {/* Controls & URL */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
                style={{ borderRadius: 'var(--radius)' }}
              >
                {uploading ? 'Processing...' : 'Replace'}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Remove
              </button>
            </div>

            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:underline truncate max-w-xs"
              title={value}
            >
              {value}
            </a>
          </div>
        </div>
      ) : (
        /* Empty drag and drop area */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-chart-2 bg-muted/50'
              : 'border-border hover:border-chart-2/70 hover:bg-muted/30'
          } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
          style={{ borderRadius: 'var(--radius)' }}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
              Optimizing and uploading to article-images...
            </div>
          ) : (
            <div className="space-y-1 py-1">
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or WebP up to 5 MB
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  )
}
