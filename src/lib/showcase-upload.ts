import { createClient } from '@/lib/supabase/client'

export const SHOWCASE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif'

/** Decode and resize in the browser before sending any image to Storage. */
export async function compressShowcaseImage(file: File): Promise<Blob> {
  if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name)) {
    throw new Error('Rasm faylini tanlang (JPG, PNG yoki WebP). / Choose an image file (JPG, PNG or WebP).')
  }
  if (file.size > 30 * 1024 * 1024) {
    throw new Error('Rasm hajmi 30 MB dan oshmasin. / Choose an image smaller than 30 MB.')
  }

  const source = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Rasmni ochib bo'lmadi. JPG, PNG yoki WebP formatiga o'tkazing. / Convert this image to JPG, PNG or WebP and try again."))
      img.src = source
    })
    const ratio = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
    const context = canvas.getContext('2d')
    if (!context) throw new Error("Rasmni tayyorlab bo'lmadi. / Could not prepare the image.")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const convert = (type: string) => new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Rasmni siqib bo'lmadi. / Could not compress the image.")), type, 0.8)
    })
    const webp = await convert('image/webp')
    return webp.type === 'image/webp' ? webp : await convert('image/jpeg')
  } finally {
    URL.revokeObjectURL(source)
  }
}

/** XHR exposes actual upload progress; the signed-in token is checked by RLS. */
export async function uploadShowcaseImage(
  file: File,
  directory: 'covers' | 'photos',
  onProgress: (progress: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  onProgress(0)
  const blob = await compressShowcaseImage(file)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) throw new Error('Administrator sifatida qayta kiring. / Sign in as the admin again.')
  const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!endpoint || !anonKey) throw new Error('Supabase sozlamalari topilmadi. / Supabase configuration is missing.')
  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${directory}/${crypto.randomUUID()}.${extension}`

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    const abort = () => request.abort()
    const cleanUp = () => signal?.removeEventListener('abort', abort)
    request.open('POST', `${endpoint.replace(/\/$/, '')}/storage/v1/object/hackathon-photos/${path}`)
    request.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
    request.setRequestHeader('apikey', anonKey)
    request.setRequestHeader('Content-Type', blob.type)
    request.setRequestHeader('Cache-Control', 'max-age=31536000')
    request.setRequestHeader('x-upsert', 'false')
    request.timeout = 120000
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100))
    }
    request.onload = () => {
      cleanUp()
      if (request.status >= 200 && request.status < 300) {
        onProgress(100)
        resolve()
      } else {
        let message = "Yuklash amalga oshmadi. Qayta urinib ko'ring. / Upload failed. Try again."
        try {
          const body = JSON.parse(request.responseText)
          if (/bucket/i.test(body.message || body.error || '')) {
            message = 'Rasmlar uchun Supabase migration_v12.sql faylini ishga tushiring. / Run Supabase migration_v12.sql to enable image uploads.'
          } else if (request.status === 401 || request.status === 403) {
            message = "Yuklash huquqi yo'q. Administrator sifatida qayta kiring. / Upload access denied. Sign in as the admin again."
          }
        } catch {
          // Storage may return a plain-text error; use the friendly fallback.
        }
        reject(new Error(message))
      }
    }
    request.onerror = request.ontimeout = () => {
      cleanUp()
      reject(new Error("Aloqani tekshiring va qayta urinib ko'ring. / Check your connection and retry the upload."))
    }
    request.onabort = () => {
      cleanUp()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) {
      cleanUp()
      reject(new DOMException('Aborted', 'AbortError'))
    } else {
      request.send(blob)
    }
  })

  return supabase.storage.from('hackathon-photos').getPublicUrl(path).data.publicUrl
}
