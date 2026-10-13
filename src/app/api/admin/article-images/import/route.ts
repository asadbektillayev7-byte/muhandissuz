import { createClient } from '@/lib/supabase/server'
import { downloadRemoteRaster, ImageImportError, optimizeImportedRaster } from '@/lib/article-image-import'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return Response.json({ error: 'Qayta kiring / Please sign in again.' }, { status: 401 })
  if (!process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) return Response.json({ error: 'Ruxsat yo‘q / Not authorized.' }, { status: 403 })

  try {
    if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ImageImportError('JSON so‘rovi talab etiladi / Expected a JSON request.', 400)
    const reader = request.body?.getReader()
    if (!reader) throw new ImageImportError('Rasm havolasi kerak / An image URL is required.', 400)
    const chunks: Uint8Array[] = []
    let length = 0
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        length += value.byteLength
        if (length > 8192) throw new ImageImportError('So‘rov juda katta / Request is too large.', 413)
        chunks.push(value)
      }
    } finally { await reader.cancel() }
    let body: { url?: unknown }
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new ImageImportError('Noto‘g‘ri so‘rov / Invalid request.', 400) }
    if (!body || typeof body.url !== 'string') throw new ImageImportError('Rasm havolasi kerak / An image URL is required.', 400)
    const bytes = await downloadRemoteRaster(body.url, { signal: request.signal })
    const image = await optimizeImportedRaster(bytes)
    return new Response(new Uint8Array(image), {
      headers: { 'Content-Type': 'image/webp', 'Content-Length': String(image.byteLength), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
    })
  } catch (error) {
    if (error instanceof ImageImportError) return Response.json({ error: error.message }, { status: error.status, headers: { 'Cache-Control': 'no-store' } })
    // Never log signed image URLs, provider response bodies, cookies or credentials.
    console.error('Article image import failed', { name: error instanceof Error ? error.name : 'UnknownError' })
    return Response.json({ error: 'Rasm yuklanmadi. Qayta urinib ko‘ring / Image import failed. Please retry.' }, { status: 500 })
  }
}
