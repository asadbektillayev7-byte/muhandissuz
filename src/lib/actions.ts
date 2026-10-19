'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { getVideoValidationError } from '@/lib/video'
import type { GalleryPhoto } from '@/lib/showcase'
import { articleTags, hasUnfinishedArticleImages, isArticleSlug } from '@/lib/article-form'
import { articleBodyToHtml, hasArticleBody } from '@/lib/article-content'
import { ARTICLE_SAVE_MAX_BYTES, type ArticleSaveResult, type SavedArticle } from '@/lib/article-save-result'
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

function revalidateMedia() {
  revalidatePath('/admin/media')
  for (const locale of ['uz', 'en']) {
    revalidatePath(`/${locale}`)
    revalidatePath(`/${locale}/media`)
  }
  revalidatePath('/[locale]/media/[id]', 'page')
}

function revalidateQuizzes() {
  revalidatePath('/admin/quiz')
  revalidatePath('/admin/quiz/[id]', 'page')
  revalidatePath('/admin/quiz/[id]/questions/[qid]', 'page')
  revalidatePath('/admin/quiz/[id]/preview', 'page')
  for (const locale of ['uz', 'en']) {
    revalidatePath(`/${locale}/quiz`)
    revalidatePath(`/${locale}/articles`)
    revalidatePath(`/${locale}`)
  }
  revalidatePath('/[locale]/quiz/[slug]', 'page')
  revalidatePath('/[locale]/articles/[slug]', 'page')
}

function isQuizTable(table: string) {
  return table === 'quizzes' || table === 'quiz_questions' || table === 'quiz_articles'
}

function validateMediaDimensions(data: { width?: unknown; height?: unknown }) {
  for (const dimension of [data.width, data.height]) {
    if (dimension === undefined || dimension === null) continue
    if (typeof dimension !== 'number' || !Number.isInteger(dimension) || dimension <= 0 || dimension > 2_147_483_647) {
      throw new Error('Rasm o‘lchamlari musbat butun son bo‘lishi kerak / Image dimensions must be positive whole numbers.')
    }
  }
}

export async function adminDeleteRecord(table: string, id: number | string) {
  await getAdminUser()
  const admin = createAdminClient()
  const { error } = await admin.from(table as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/${table}`)
  revalidateShowcase(table)
  if (table === 'articles') revalidateArticles()
  if (table === 'media') revalidateMedia()
  if (isQuizTable(table)) revalidateQuizzes()
}

export async function adminSaveRecord(table: string, data: Record<string, unknown>, id?: number | string) {
  await getAdminUser()
  if (table === 'media') validateMediaDimensions(data)
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
    // Draft is enforced at the write boundary, even if an old client sends
    // published:true. Publishing remains an explicit update after review.
    const values = table === 'quizzes' ? { ...data, published: false } : data
    const { data: d, error } = await admin.from(table as any).insert(values).select()
    if (error) throw new Error(error.message)
    result = d
  }
  revalidatePath(`/admin/${table}`)
  revalidateShowcase(table)
  if (table === 'media') revalidateMedia()
  if (isQuizTable(table)) revalidateQuizzes()
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

  let changed = false
  try {
    if (featured) {
      const { error: clearError } = await admin
        .from('quizzes')
        .update({ featured: false })
        .eq('featured', true)
        .neq('id', quizId)
      if (clearError) throw new Error(clearError.message)
      changed = true
    }

    const { error } = await admin.from('quizzes').update({ featured }).eq('id', quizId)
    if (error) throw new Error(error.message)
    changed = true
  } finally {
    if (changed) revalidateQuizzes()
  }
}

// ── Quiz ↔ article links ──

export async function adminSetQuizArticles(quizId: number, articleIds: number[]) {
  await getAdminUser()
  const admin = createAdminClient()

  const { error: delError } = await admin.from('quiz_articles').delete().eq('quiz_id', quizId)
  if (delError) throw new Error(delError.message)

  try {
    if (articleIds.length > 0) {
      const rows = [...new Set(articleIds)].map((article_id) => ({ quiz_id: quizId, article_id }))
      const { error } = await admin.from('quiz_articles').insert(rows)
      if (error) throw new Error(error.message)
    }
  } finally {
    // The old links were already removed, including when replacement fails.
    revalidateQuizzes()
  }
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

function articleSaveFailure(code: string, message: string, reference?: string): ArticleSaveResult {
  return { ok: false, error: { code, message, ...(reference ? { reference } : {}) } }
}

function logArticleSaveFailure(stage: string, problem: unknown): string {
  const reference = crypto.randomUUID()
  const details = problem && typeof problem === 'object' ? problem as { code?: unknown; message?: unknown; name?: unknown } : {}
  const code = typeof details.code === 'string' && /^(?:[A-Z0-9]{5}|PGRST\d+)$/.test(details.code) ? details.code : undefined
  const name = typeof details.name === 'string' && ['Error', 'TypeError', 'RangeError', 'SyntaxError', 'AbortError'].includes(details.name) ? details.name : undefined
  const constraint = typeof details.message === 'string' ? details.message.match(/unique constraint "(articles_pkey|articles_slug_key)"/i)?.[1] : undefined
  // SQL messages/details may contain submitted values. Keep useful codes and
  // stack locations, but omit raw messages, article content and credentials.
  const frames = problem instanceof Error ? problem.stack?.split('\n').filter(line => /^\s*at /.test(line)).slice(0, 5) : undefined
  console.error('Article save failed', { reference, stage, code, name, constraint, frames })
  return reference
}

function articleDatabaseFailure(problem: { code?: string; message?: string; details?: string }, reference: string): ArticleSaveResult {
  if (problem.code === '23505') {
    const constraint = problem.message?.match(/unique constraint "([^"]+)"/i)?.[1]
    // A primary-key/sequence problem must never tell an editor to change their
    // article URL. Only identify a slug conflict from its actual constraint/key.
    if (constraint === 'articles_slug_key' || /^Key \(slug\)=/.test(problem.details || '')) {
      return articleSaveFailure('SLUG_CONFLICT', 'Bu manzil band. Boshqa manzil tanlang / This article URL is already used. Choose another URL.', reference)
    }
    if (constraint === 'articles_pkey' || /^Key \(id\)=/.test(problem.details || '')) {
      return articleSaveFailure('ARTICLE_ID_CONFLICT', 'Maqola raqami band. Ma\'lumotlar bazasidagi maqola hisoblagichini tekshirish kerak / Article ID conflict. The database article counter needs checking.', reference)
    }
    return articleSaveFailure('SAVE_CONFLICT', 'Maqola ma\'lumotlari boshqa yozuv bilan takrorlanmoqda / Article data conflicts with another record.', reference)
  }
  if (problem.code === 'PGRST204' || problem.code === '42703') {
    return articleSaveFailure('SCHEMA_NOT_READY', 'Avval supabase/migration_v13.sql faylini bajaring / Run the article editor SQL migration first.', reference)
  }
  if (problem.code === '23503') return articleSaveFailure('RELATED_RECORD_MISSING', 'Tanlangan muallif yoki kategoriya endi mavjud emas. Qayta tanlang / A selected author or category no longer exists. Select it again.', reference)
  if (problem.code === 'PGRST116') return articleSaveFailure('ARTICLE_NOT_FOUND', 'Maqola topilmadi. Maqolalar ro\'yxatini yangilang / Article not found. Refresh the article list.', reference)
  if (problem.code === '42501') return articleSaveFailure('DATABASE_ACCESS_DENIED', 'Saqlash huquqi yo\'q. Ma\'lumotlar bazasi ruxsatlarini tekshiring / Database access denied. Check article write permissions.', reference)
  if (problem.code === '23502') return articleSaveFailure('REQUIRED_FIELD_MISSING', 'Majburiy ma\'lumot yetishmaydi. Sarlavha va nashr sanasini tekshiring / Required information is missing. Check the title and publication date.', reference)
  return articleSaveFailure('SAVE_FAILED', 'Maqolani saqlab bo\'lmadi. Qayta urinib ko\'ring / Could not save the article. Please retry.', reference)
}

export async function adminSaveArticle(data: Record<string, unknown>, id?: number): Promise<ArticleSaveResult> {
  let stage = 'authentication'
  try {
    try { await getAdminUser() }
    catch (problem) {
      if (problem instanceof Error && problem.message === 'Not authenticated') return articleSaveFailure('UNAUTHENTICATED', 'Sessiya tugagan. Administrator sifatida qayta kiring / Your session expired. Sign in as the admin again.')
      if (problem instanceof Error && problem.message === 'Not authorized') return articleSaveFailure('FORBIDDEN', 'Faqat administrator maqolani saqlay oladi / Only the admin can save articles.')
      throw problem
    }
    stage = 'validation'
    if (!data || typeof data !== 'object' || Array.isArray(data)) return articleSaveFailure('INVALID_PAYLOAD', 'Maqola ma\'lumotlari noto\'g\'ri / Invalid article data.')
    if (id !== undefined && (!Number.isSafeInteger(id) || id < 1)) return articleSaveFailure('INVALID_ARTICLE_ID', 'Maqola raqami noto\'g\'ri / Invalid article ID.')
    const slug = typeof data.slug === 'string' ? data.slug.trim() : ''
    if (!isArticleSlug(slug)) return articleSaveFailure('INVALID_SLUG', 'Manzil: kichik lotin harflari, raqam va tire ishlating / Use a valid lowercase URL slug.')
    if (new TextEncoder().encode(JSON.stringify(data)).byteLength > ARTICLE_SAVE_MAX_BYTES) return articleSaveFailure('ARTICLE_TOO_LARGE', 'Maqola juda katta (2 MB) / Article exceeds 2 MB. Upload images instead of embedding their data.')
    const values: Record<string, unknown> = { slug, published: data.published === true }
    stage = 'content'
    for (const locale of ['uz', 'en', 'ru']) {
      for (const name of ['title', 'excerpt', 'meta_description']) {
        const value = data[`${name}_${locale}`]
        values[`${name}_${locale}`] = typeof value === 'string' ? value.trim() : ''
      }
      const body = data[`body_${locale}`]
      if (hasUnfinishedArticleImages(body)) return articleSaveFailure('UNFINISHED_IMAGES', `Rasm yuklash tugamagan (${locale.toUpperCase()}) / Finish, retry or remove unfinished images.`)
      values[`body_${locale}`] = articleBodyToHtml(body)
    }
    if (values.published && (!values.title_uz || !hasArticleBody(values.body_uz))) {
      return articleSaveFailure('MISSING_UZBEK_CONTENT', 'Nashr qilish uchun o\'zbekcha sarlavha va matn kerak / Add the Uzbek title and body before publishing.')
    }
    stage = 'validation'
    const publishDate = typeof data.published_date === 'string' ? new Date(data.published_date) : new Date()
    if (!Number.isFinite(publishDate.getTime())) return articleSaveFailure('INVALID_PUBLICATION_DATE', 'Nashr sanasi noto\'g\'ri / Invalid publication date.')
    values.published_date = publishDate.toISOString()
    values.tags = articleTags(data.tags)
    for (const field of ['category_id', 'author_id', 'translator_id']) {
      const value = data[field]
      if (value !== null && value !== undefined && (!Number.isSafeInteger(value) || Number(value) < 1)) return articleSaveFailure('INVALID_RELATED_RECORD', 'Muallif yoki kategoriya noto\'g\'ri. Ro\'yxatdan qayta tanlang / Invalid author or category. Select it again from the list.')
      values[field] = value ?? null
    }
    for (const field of ['cover_image_url', 'og_image_url']) {
      const value = typeof data[field] === 'string' ? data[field].trim() : ''
      if (value) {
        try { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error() }
        catch { return articleSaveFailure('INVALID_IMAGE_URL', 'Rasm manzili noto\'g\'ri / Invalid image URL.') }
      }
      values[field] = value || null
    }
    for (const field of ['department_leader', 'editor', 'translator', 'researcher']) values[field] = typeof data[field] === 'string' ? data[field].trim().slice(0, 200) : null
    values.original_language = data.original_language === 'en' ? 'en' : 'uz'
    stage = 'database-client'
    const admin = createAdminClient()
    stage = 'slug-check'
    let duplicateQuery = admin.from('articles').select('id').eq('slug', slug)
    if (id) duplicateQuery = duplicateQuery.neq('id', id)
    const { data: duplicate, error: slugError } = await duplicateQuery.maybeSingle()
    if (slugError) {
      const reference = logArticleSaveFailure(stage, slugError)
      return articleSaveFailure('SLUG_CHECK_FAILED', 'Manzilni tekshirib bo\'lmadi. Qayta urinib ko\'ring / Could not check the article URL. Please retry.', reference)
    }
    if (duplicate) return articleSaveFailure('SLUG_CONFLICT', 'Bu manzil band. Boshqa manzil tanlang / This URL is used by another article.')
    stage = 'database-write'
    const query = id ? admin.from('articles').update(values).eq('id', id) : admin.from('articles').insert(values)
    const { data: saved, error } = await query.select('id, slug, published, published_date').single()
    if (error) return articleDatabaseFailure(error, logArticleSaveFailure(stage, error))
    const article = saved as SavedArticle
    // The row is already committed. A cache failure must not report a failed
    // insert, which would invite a second create and risk duplicate articles.
    try { revalidateArticles() }
    catch (problem) {
      const reference = logArticleSaveFailure('cache-revalidation', problem)
      return { ok: true, article, warning: `Maqola saqlandi, lekin sahifalarni yangilab bo\'lmadi. Sahifani yangilang / Article saved, but page refresh failed. Reload the page. (${reference})` }
    }
    return { ok: true, article }
  } catch (problem) {
    const reference = logArticleSaveFailure(stage, problem)
    return articleSaveFailure('UNEXPECTED_SAVE_ERROR', 'Maqolani saqlashda server xatosi yuz berdi. Nusxangiz muharrirda saqlanadi / A server error prevented saving. Your draft remains in the editor.', reference)
  }
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
  width?: number
  height?: number
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
  validateMediaDimensions(data)
  const admin = createAdminClient()
  const { error } = await admin.from('media').insert(data)
  if (error) throw new Error(error.message)
  revalidateMedia()
}

// ── AI-drafted quiz questions ──

/**
 * Drafts questions from the articles already linked to a quiz. Returns them
 * to the caller without saving: the admin reviews the drafts and only what
 * they approve is written, by adminSaveGeneratedQuestions below.
 */
export async function adminGenerateQuizQuestions(quizId: number, count: number) {
  await getAdminUser()
  if (!Number.isInteger(count) || count < 1 || count > 15) {
    throw new Error('Savollar soni 1 dan 15 gacha bo‘lishi kerak / Choose between 1 and 15 questions.')
  }
  const admin = createAdminClient()

  const { data: links, error: linkError } = await admin
    .from('quiz_articles')
    .select('article_id')
    .eq('quiz_id', quizId)
  if (linkError) throw new Error(linkError.message)

  const ids = [...new Set((links ?? []).map((l) => l.article_id))]
  if (ids.length === 0) {
    throw new Error('Link at least one article to this quiz first, then generate.')
  }

  const { data: articles, error: articleError } = await admin
    .from('articles')
    .select('id, title_uz, body_uz')
    .in('id', ids)
    .eq('published', true)
    .lte('published_date', new Date().toISOString())
  if (articleError) throw new Error(articleError.message)
  if (articles?.length !== ids.length) {
    throw new Error('Faqat hozir nashr qilingan maqolalarni tanlang. Qoralama yoki rejalashtirilgan maqolalarni olib tashlang. / Link only articles that are publicly available now. Remove draft or scheduled articles before generating.')
  }

  const source = (articles ?? []).map((a) => ({
    title: a.title_uz ?? '',
    body: richTextToPlain(a.body_uz),
  }))

  // Do not silently skip a linked article and claim that all sources were used.
  const incomplete = source.filter((a) => !a.title.trim() || a.body.trim().length <= 200)
  if (incomplete.length > 0) {
    const names = incomplete.map((a) => a.title).filter(Boolean).join(', ')
    throw new Error(
      `Maqola matni yetarli emas / These articles need more body text: ${names}. ` +
        'Avval maqola matnini to‘ldiring / Complete the article content before generating questions.'
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

  const { data: existing, error: existingError } = await admin
    .from('quiz_questions')
    .select('sort_order')
    .eq('quiz_id', quizId)
    .order('sort_order', { ascending: false })
    .limit(1)
  if (existingError) throw new Error(existingError.message)

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

  revalidateQuizzes()
  return questions.length
}
