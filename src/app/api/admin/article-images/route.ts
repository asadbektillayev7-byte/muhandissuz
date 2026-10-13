import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 100

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return Response.json({ error: 'Qayta kiring / Please sign in again.' }, { status: 401 })
  if (!process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) return Response.json({ error: 'Ruxsat yo‘q / Not authorized.' }, { status: 403 })
  const cursor = Number(new URL(request.url).searchParams.get('cursor') || 0)
  if (!Number.isSafeInteger(cursor) || cursor < 0 || cursor > 1_000_000) return Response.json({ error: 'Invalid cursor.' }, { status: 400 })
  const [uploads, media] = await Promise.all([
    supabase.storage.from('article-images').list('', { limit: PAGE_SIZE, offset: cursor, sortBy: { column: 'created_at', order: 'desc' } }),
    supabase.from('media').select('url,filename,alt_uz,mime_type').like('mime_type', 'image/%').order('created_at', { ascending: false }).range(cursor, cursor + PAGE_SIZE - 1),
  ])
  if (uploads.error && media.error) return Response.json({ error: 'Rasmlar kutubxonasi yuklanmadi / Could not load the image library.' }, { status: 500 })
  const images = (uploads.data || [])
    .filter((file) => file.id && /\.(png|jpe?g|webp|gif|avif)$/i.test(file.name))
    .map((file) => ({ url: supabase.storage.from('article-images').getPublicUrl(file.name).data.publicUrl, name: file.name, altText: '' }))
  for (const item of media.data || []) {
    if (typeof item.url === 'string' && /^https:\/\//i.test(item.url) && !images.some((image) => image.url === item.url)) {
      images.push({ url: item.url, name: item.filename || '', altText: item.alt_uz || '' })
    }
  }
  return Response.json({
    images,
    nextCursor: uploads.data?.length === PAGE_SIZE || media.data?.length === PAGE_SIZE ? cursor + PAGE_SIZE : null,
    warnings: uploads.error || media.error ? ['Kutubxonaning bir qismi yuklanmadi / Part of the image library could not be loaded.'] : [],
  }, { headers: { 'Cache-Control': 'no-store' } })
}
