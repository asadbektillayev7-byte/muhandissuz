'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

async function getClientIp(): Promise<string> {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
}

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  if (user.email !== process.env.ADMIN_EMAIL) throw new Error('Not authorized')
  return user
}

// ── Rate limiting (no auth required) ──

// Rate limiting is best-effort. If it fails (missing service-role key,
// network trouble, missing table) it must never prevent signing in.

export async function checkRateLimit(): Promise<{ blocked: boolean }> {
  try {
    const ip = await getClientIp()
    const admin = createAdminClient()
    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('attempted_at', cutoff)
    return { blocked: (count || 0) >= 5 }
  } catch {
    return { blocked: false }
  }
}

export async function recordLoginAttempt() {
  try {
    const ip = await getClientIp()
    const admin = createAdminClient()
    await admin.from('login_attempts').insert({ ip_address: ip, attempted_at: new Date().toISOString() })
  } catch {
    // ignored
  }
}

export async function clearLoginAttempts() {
  try {
    const ip = await getClientIp()
    const admin = createAdminClient()
    await admin.from('login_attempts').delete().eq('ip_address', ip)
  } catch {
    // ignored
  }
}

// ── Admin record CRUD ──

export async function adminDeleteRecord(table: string, id: number | string) {
  await getAdminUser()
  const admin = createAdminClient()
  const { error } = await admin.from(table as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/${table}`)
}

export async function adminSaveRecord(table: string, data: Record<string, unknown>, id?: number | string) {
  await getAdminUser()
  const admin = createAdminClient()
  let result
  if (id) {
    const { data: d, error } = await admin.from(table as any).update(data).eq('id', id).select()
    if (error) throw new Error(error.message)
    result = d
  } else {
    const { data: d, error } = await admin.from(table as any).insert(data).select()
    if (error) throw new Error(error.message)
    result = d
  }
  revalidatePath(`/admin/${table}`)
  return result
}

// ── Featured quiz ──

/**
 * At most one quiz is featured. Clearing the previous one first matters:
 * a unique index rejects a second featured row, so setting before clearing
 * would fail.
 */
export async function adminSetFeaturedQuiz(quizId: number, featured: boolean) {
  await getAdminUser()
  const admin = createAdminClient()

  if (featured) {
    const { error: clearError } = await admin
      .from('quizzes')
      .update({ featured: false })
      .eq('featured', true)
      .neq('id', quizId)
    if (clearError) throw new Error(clearError.message)
  }

  const { error } = await admin.from('quizzes').update({ featured }).eq('id', quizId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/quiz')
}

// ── Quiz ↔ article links ──

export async function adminSetQuizArticles(quizId: number, articleIds: number[]) {
  await getAdminUser()
  const admin = createAdminClient()

  const { error: delError } = await admin.from('quiz_articles').delete().eq('quiz_id', quizId)
  if (delError) throw new Error(delError.message)

  if (articleIds.length > 0) {
    const rows = articleIds.map((article_id) => ({ quiz_id: quizId, article_id }))
    const { error } = await admin.from('quiz_articles').insert(rows)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/quiz')
}

// ── Article-specific ──

export async function adminSaveArticle(data: Record<string, unknown>, id?: number) {
  await getAdminUser()
  const admin = createAdminClient()
  if (id) {
    const { error } = await admin.from('articles').update(data).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await admin.from('articles').insert(data)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/admin/articles')
}

// ── Slug uniqueness check ──

export async function adminCheckSlug(slug: string, table: string, excludeId?: number): Promise<boolean> {
  const admin = createAdminClient()
  let query = admin.from(table as any).select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query.maybeSingle()
  return !!data
}

// ── Media ──

export async function adminInsertMedia(data: {
  filename: string
  url: string
  thumbnail_url: string
  alt_uz: string
  alt_en?: string
  mime_type: string
  filesize: number
  title_uz?: string
  title_en?: string
  location_uz?: string
  location_en?: string
  description_uz?: string
  description_en?: string
  event_date?: string
  poster_url?: string
}) {
  await getAdminUser()
  const admin = createAdminClient()
  const { error } = await admin.from('media').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/media')
}
