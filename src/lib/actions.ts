'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { getVideoValidationError } from '@/lib/video'
import type { GalleryPhoto } from '@/lib/showcase'
import { articleTags, hasUnfinishedArticleImages, isArticleSlug } from '@/lib/article-form'
import { articleBodyToHtml, hasArticleBody } from '@/lib/article-content'
import {
  generateQuestions,
  richTextToPlain,
  QuizGenerationError,
  type DraftQuestion,
} from '@/lib/quizGeneration'

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

function revalidateShowcase(table: string) {
  const section = table === 'hackathons' ? 'hackathons' : table === 'student_projects' ? 'projects' : null
  if (!section) return
  revalidatePath(`/admin/${section}`)
  for (const locale of ['uz', 'en']) {
    revalidatePath(`/${locale}/${section}`)
    revalidatePath(`/${locale}`)
    revalidatePath(`/${locale}/about`)
  }
  revalidatePath(`/[locale]/${section}/[slug]`, 'page')
  revalidatePath('/sitemap.xml')
}

export async function adminDeleteRecord(table: string, id: number | string) {
  await getAdminUser()
  const admin = createAdminClient()
  const { error } = await admin.from(table as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/${table}`)
  revalidateShowcase(table)
  if (table === 'articles') revalidateArticles()
}

export async function adminSaveRecord(table: string, data: Record<string, unknown>, id?: number | string) {
  await getAdminUser()
  if (table === 'hackathons' || table === 'student_projects') {
    const videoError = getVideoValidationError(
      typeof data.video_url === 'string' ? data.video_url : null,
      typeof data.cover_image_url === 'string' ? data.cover_image_url : null,
    )
    if (videoError) throw new Error(videoError)
  }
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
  revalidateShowcase(table)
  return result
}

export async function adminSaveHackathonPhotos(hackathonId: string | number, photos: GalleryPhoto[]) {
  await getAdminUser()
  const supabase = await createClient()
  const { error } = await supabase.rpc('replace_hackathon_photos', {
    p_hackathon_id: hackathonId,
    p_photos: photos.map((photo, position) => ({
      id: photo.id, url: photo.url, caption: photo.caption?.trim() || null, position,
    })),
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/hackathons/${hackathonId}`)
  revalidateShowcase('hackathons')
}

// ── Feedback moderation ──

/** Visitor feedback only reaches the landing page once approved here. */
export async function adminSetFeedbackApproved(id: number, approved: boolean) {
  await getAdminUser()
  const admin = createAdminClient()
  const { error } = await admin.from('feedback').update({ approved }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/feedback')
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

function revalidateArticles() {
  revalidatePath('/admin/articles')
  revalidatePath('/admin/articles/[id]', 'page')
  revalidatePath('/[locale]/articles/[slug]', 'page')
  for (const locale of ['uz', 'en', 'ru']) {
    revalidatePath(`/${locale}/articles`)
    revalidatePath(`/${locale}`)
    revalidatePath(`/${locale}/about`)
  }
  revalidatePath('/sitemap.xml')
}

export async function adminSaveArticle(data: Record<string, unknown>, id?: number) {
  await getAdminUser()
  if (id !== undefined && (!Number.isSafeInteger(id) || id < 1)) throw new Error('Invalid article ID')
  const slug = typeof data.slug === 'string' ? data.slug.trim() : ''
  if (!isArticleSlug(slug)) throw new Error("Manzil: kichik lotin harflari, raqam va tire ishlating / Use a valid lowercase URL slug.")
  if (JSON.stringify(data).length > 2_000_000) throw new Error("Maqola juda katta (2 MB) / Article exceeds 2 MB. Upload images instead of embedding their data.")
  const values: Record<string, unknown> = { slug, published: data.published === true }
  for (const locale of ['uz', 'en', 'ru']) {
    for (const name of ['title', 'excerpt', 'meta_description']) {
      const value = data[`${name}_${locale}`]
      values[`${name}_${locale}`] = typeof value === 'string' ? value.trim() : ''
    }
    const body = data[`body_${locale}`]
    if (hasUnfinishedArticleImages(body)) throw new Error(`Rasm yuklash tugamagan (${locale.toUpperCase()}) / Finish, retry or remove unfinished images.`)
    values[`body_${locale}`] = articleBodyToHtml(body)
  }
  if (values.published && (!values.title_uz || !hasArticleBody(values.body_uz))) {
    throw new Error("Nashr qilish uchun o'zbekcha sarlavha va matn kerak / Add the Uzbek title and body before publishing.")
  }
  const publishDate = typeof data.published_date === 'string' ? new Date(data.published_date) : new Date()
  if (!Number.isFinite(publishDate.getTime())) throw new Error('Nashr sanasi noto\'g\'ri / Invalid publication date.')
  values.published_date = publishDate.toISOString()
  values.tags = articleTags(data.tags)
  for (const field of ['category_id', 'author_id', 'translator_id']) {
    const value = data[field]
    if (value !== null && value !== undefined && (!Number.isSafeInteger(value) || Number(value) < 1)) throw new Error(`Invalid ${field}`)
    values[field] = value ?? null
  }
  for (const field of ['cover_image_url', 'og_image_url']) {
    const value = typeof data[field] === 'string' ? data[field].trim() : ''
    if (value) {
      try { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error() }
      catch { throw new Error('Rasm manzili noto\'g\'ri / Invalid image URL.') }
    }
    values[field] = value || null
  }
  for (const field of ['department_leader', 'editor', 'translator', 'researcher']) values[field] = typeof data[field] === 'string' ? data[field].trim().slice(0, 200) : null
  values.original_language = data.original_language === 'en' ? 'en' : 'uz'
  const admin = createAdminClient()
  let duplicateQuery = admin.from('articles').select('id').eq('slug', slug)
  if (id) duplicateQuery = duplicateQuery.neq('id', id)
  const { data: duplicate, error: slugError } = await duplicateQuery.maybeSingle()
  if (slugError) throw new Error('Manzilni tekshirib bo\'lmadi / Could not check article URL.')
  if (duplicate) throw new Error('Bu manzil band. Boshqa manzil tanlang / This URL is used by another article.')
  const query = id ? admin.from('articles').update(values).eq('id', id) : admin.from('articles').insert(values)
  const { data: saved, error } = await query.select('id, slug, published, published_date').single()
  if (error) {
    console.error('Article save failed', { code: error.code, message: error.message })
    if (error.code === '23505') throw new Error('Bu manzil band / This article URL is already used.')
    if (error.code === 'PGRST204' || error.code === '42703') throw new Error('Avval supabase/migration_v13.sql faylini bajaring / Run the article editor SQL migration first.')
    throw new Error('Maqolani saqlab bo\'lmadi. Qayta urinib ko\'ring / Could not save; please retry.')
  }
  revalidateArticles()
  return saved as { id: number; slug: string; published: boolean; published_date: string }
}

// ── Slug uniqueness check ──

export async function adminCheckSlug(slug: string, table: string, excludeId?: number): Promise<boolean> {
  await getAdminUser()
  const admin = createAdminClient()
  let query = admin.from(table as any).select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query.maybeSingle()
  if (error) throw new Error('Could not check URL availability')
  return !!data
}

// ── Media ──

export async function adminInsertMedia(data: {
  filename: string
  url: string
  // Optional: a video has no thumbnail of its own to point at.
  thumbnail_url?: string
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

// ── AI-drafted quiz questions ──

/**
 * Drafts questions from the articles already linked to a quiz. Returns them
 * to the caller without saving: the admin reviews the drafts and only what
 * they approve is written, by adminSaveGeneratedQuestions below.
 */
export async function adminGenerateQuizQuestions(quizId: number, count: number) {
  await getAdminUser()
  const admin = createAdminClient()

  const { data: links, error: linkError } = await admin
    .from('quiz_articles')
    .select('article_id')
    .eq('quiz_id', quizId)
  if (linkError) throw new Error(linkError.message)

  const ids = (links ?? []).map((l) => l.article_id)
  if (ids.length === 0) {
    throw new Error('Link at least one article to this quiz first, then generate.')
  }

  const { data: articles, error: articleError } = await admin
    .from('articles')
    .select('title_uz, body_uz')
    .in('id', ids)
  if (articleError) throw new Error(articleError.message)

  const source = (articles ?? []).map((a) => ({
    title: a.title_uz ?? '',
    body: richTextToPlain(a.body_uz),
  }))

  // Worth naming explicitly: the seeded articles carry only a title, an
  // excerpt and a cover image, so this is the failure an admin will hit first.
  if (source.every((a) => a.body.trim().length === 0)) {
    const names = source.map((a) => a.title).filter(Boolean).join(', ')
    throw new Error(
      `These articles have no body text yet, so there is nothing to build questions from: ${names}. ` +
        'Write the article content in the article editor first.'
    )
  }

  try {
    return await generateQuestions({ articles: source, count })
  } catch (e) {
    // QuizGenerationError messages are written for the admin; anything else
    // could carry internals, so it is not passed through verbatim.
    if (e instanceof QuizGenerationError) throw new Error(e.message)
    throw new Error('Could not reach Gemini. Check the API key and try again.')
  }
}

/** Appends approved drafts to a quiz, after the existing questions. */
export async function adminSaveGeneratedQuestions(
  quizId: number,
  questions: DraftQuestion[]
) {
  await getAdminUser()
  if (questions.length === 0) return 0

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('quiz_questions')
    .select('sort_order')
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const start = (existing?.[0]?.sort_order ?? -1) + 1

  const { error } = await admin.from('quiz_questions').insert(
    questions.map((q, i) => ({
      quiz_id: quizId,
      question_uz: q.question_uz,
      question_en: q.question_en || null,
      options_uz: q.options_uz,
      options_en: q.options_en,
      correct_index: q.correct_index,
      explanation_uz: q.explanation_uz || null,
      explanation_en: q.explanation_en || null,
      sort_order: start + i,
    }))
  )
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/quiz/${quizId}`)
  return questions.length
}
