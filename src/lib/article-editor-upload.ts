'use client'

import { createClient } from './supabase/client'

const MAX_SOURCE_BYTES = 20 * 1024 * 1024
const IMAGE_TYPES = /^image\/(jpeg|png|webp|gif|avif)$/i

/** Fetch remote images through the admin API (DNS/IP/redirect/size checks), then
 * compress before Storage. Blob/data clipboard images never leave the browser raw. */
async function sourceToFile(source: File | string, signal?: AbortSignal): Promise<File> {
  if (typeof source !== 'string') return source
  let response: Response
  if (source.startsWith('data:')) {
    if (source.length > MAX_SOURCE_BYTES * 1.4 || !/^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(source)) {
      throw new Error("Rasm formati yoki hajmi mos emas. / This pasted image is too large or unsupported.")
    }
    response = await fetch(source, { signal })
  } else if (source.startsWith('blob:')) {
    response = await fetch(source, { signal })
  } else if (/^https?:\/\//i.test(source)) {
    response = await fetch('/api/admin/article-images/import', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: source }), signal,
    })
  } else {
    throw new Error("Bu rasmga kirib bo'lmadi. Faylni kompyuterdan tanlang. / This image is unavailable. Select the original file from your computer.")
  }
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.error || "Rasmni yuklab bo'lmadi. / Could not download the image.")
  }
  const blob = await response.blob()
  if (!IMAGE_TYPES.test(blob.type) || blob.size > MAX_SOURCE_BYTES) throw new Error('Rasm 20 MB dan kichik JPG, PNG, WebP, GIF yoki AVIF fayli bo\'lishi kerak. / Choose a supported image smaller than 20 MB.')
  return new File([blob], `pasted-image.${blob.type.split('/')[1]}`, { type: blob.type })
}

export async function compressArticleEditorImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  if (!IMAGE_TYPES.test(file.type) && !/\.(png|jpe?g|webp|gif|avif)$/i.test(file.name)) throw new Error('JPG, PNG, WebP, GIF yoki AVIF rasmini tanlang. / Choose a JPG, PNG, WebP, GIF or AVIF image.')
  if (file.size > MAX_SOURCE_BYTES) throw new Error('Rasm 20 MB dan kichik bo\'lsin. / Image must be smaller than 20 MB.')
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Rasmni ochib bo'lmadi. JPG yoki PNG formatini tanlang. / Could not decode this image. Try JPG or PNG."))
      img.src = url
    })
    const scale = Math.min(1, 1600 / image.naturalWidth)
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    if (width * height > 24_000_000) throw new Error('Rasm o\'lchamlari juda katta. / Image dimensions are too large.')
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error("Rasmni tayyorlab bo'lmadi. / Image processing is unavailable.")
    context.drawImage(image, 0, 0, width, height)
    const convert = (type: string) => new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Rasmni siqib bo\'lmadi. / Image compression failed.')), type, 0.8))
    const webp = await convert('image/webp')
    return { blob: webp.type === 'image/webp' ? webp : await convert('image/jpeg'), width, height }
  } finally { URL.revokeObjectURL(url) }
}

export async function uploadEditorImage(source: File | string, onProgress: (progress: number) => void, signal?: AbortSignal): Promise<{ url: string; width: number; height: number }> {
  onProgress(0)
  const file = await sourceToFile(source, signal)
  const { blob, width, height } = await compressArticleEditorImage(file)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) throw new Error('Administrator sifatida qayta kiring. / Sign in as the admin again.')
  const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!endpoint || !anonKey) throw new Error('Supabase sozlamalari topilmadi. / Supabase configuration is missing.')
  const path = `${crypto.randomUUID()}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`
  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    const abort = () => request.abort()
    const cleanup = () => signal?.removeEventListener('abort', abort)
    request.open('POST', `${endpoint.replace(/\/$/, '')}/storage/v1/object/article-images/${path}`)
    request.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
    request.setRequestHeader('apikey', anonKey)
    request.setRequestHeader('Content-Type', blob.type)
    request.setRequestHeader('Cache-Control', 'max-age=31536000')
    request.setRequestHeader('x-upsert', 'false')
    request.timeout = 120000
    request.upload.onprogress = event => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)) }
    request.onload = () => {
      cleanup()
      if (request.status >= 200 && request.status < 300) { onProgress(100); resolve() }
      else reject(new Error(request.status === 401 || request.status === 403 ? 'Administrator sifatida qayta kiring. / Sign in as the admin again.' : 'Rasm saqlanmadi. Aloqa va article-images bucket sozlamalarini tekshiring. / Upload failed. Check your connection and the article-images bucket.'))
    }
    request.onerror = request.ontimeout = () => { cleanup(); reject(new Error("Aloqani tekshirib, qayta urinib ko'ring. / Check your connection and retry.")) }
    request.onabort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')) }
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) { cleanup(); reject(new DOMException('Aborted', 'AbortError')) } else request.send(blob)
  })
  return { url: supabase.storage.from('article-images').getPublicUrl(path).data.publicUrl, width, height }
}
