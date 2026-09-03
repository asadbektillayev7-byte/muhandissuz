'use server'

import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPublicClient } from '@/lib/supabase/public'
import {
  askGemini,
  renderSiteContext,
  ChatError,
  type ChatErrorCode,
  MAX_HISTORY,
  MAX_MESSAGE_CHARS,
  MAX_PHOTO_BYTES,
  MAX_VOICE_BYTES,
  type ChatTurn,
} from '@/lib/chat'

/**
 * Public chat endpoint. Deliberately kept out of actions.ts, which is the
 * admin surface — nothing here may reach an admin-only helper.
 */

/** Text is cheap, so it gets an hourly allowance. */
const TEXT_LIMIT = 20
const TEXT_WINDOW_MINUTES = 60

/**
 * Photos and voice notes cost several times more per message and this is a
 * public endpoint, so they are capped per day rather than per hour.
 */
const MEDIA_LIMITS: Record<'photo' | 'voice', number> = { photo: 1, voice: 2 }
const MEDIA_WINDOW_HOURS = 24

async function getClientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

/**
 * Unlike the login limiter, this one fails CLOSED: if the counter cannot be
 * read we refuse rather than hand an unmetered endpoint to the internet.
 */
async function checkAndRecord(
  kind: 'text' | 'photo' | 'voice'
): Promise<{ allowed: boolean; reason?: 'rate' | 'media' }> {
  const ip = await getClientIp()
  try {
    const admin = createAdminClient()

    // Deliberately not filtered by kind: this query must keep working even
    // before migration_v11 adds that column, or a pending migration would
    // take the whole chat down rather than just the media features.
    const textCutoff = new Date(Date.now() - TEXT_WINDOW_MINUTES * 60_000).toISOString()
    const { count, error } = await admin
      .from('chat_requests')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', textCutoff)

    // A missing table answers 204 with count null and NO error, so treating a
    // null count as zero would silently let every request through. Anything
    // other than a real number means the limiter is not working — deny.
    if (error || typeof count !== 'number') throw new Error('rate limiter unavailable')
    if (count >= TEXT_LIMIT) return { allowed: false, reason: 'rate' }

    if (kind !== 'text') {
      const mediaCutoff = new Date(Date.now() - MEDIA_WINDOW_HOURS * 3_600_000).toISOString()
      const { count: used, error: mediaError } = await admin
        .from('chat_requests')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .eq('kind', kind)
        .gte('created_at', mediaCutoff)

      if (mediaError || typeof used !== 'number') throw new Error('media limiter unavailable')
      if (used >= MEDIA_LIMITS[kind]) return { allowed: false, reason: 'media' }
    }

    // If the row cannot be written the request is not being counted, so it
    // must not be served either.
    const { error: insertError } = await admin
      .from('chat_requests')
      .insert({ ip_address: ip, kind })

    if (insertError) {
      // Before migration_v11 the kind column does not exist. Text must keep
      // working in that window — it is still counted, just untyped — while
      // media stays denied, because its per-day check cannot run at all.
      if (kind !== 'text') throw insertError
      const { error: retryError } = await admin
        .from('chat_requests')
        .insert({ ip_address: ip })
      if (retryError) throw retryError
    }

    return { allowed: true }
  } catch {
    return { allowed: false, reason: kind === 'text' ? 'rate' : 'media' }
  }
}

/** Titles and excerpts only — enough to point at a page, never a body. */
async function loadCatalogue(locale: string): Promise<string> {
  const supabase = createPublicClient()
  const uz = locale !== 'en'

  const [articles, quizzes, hackathons, projects] = await Promise.all([
    supabase
      .from('articles')
      .select('slug, title_uz, title_en, excerpt_uz, excerpt_en, categories(name_uz, name_en)')
      .eq('published', true)
      .order('published_date', { ascending: false })
      .limit(60),
    supabase.from('quizzes').select('title_uz, title_en, difficulty').eq('published', true).limit(40),
    supabase.from('hackathons').select('title_uz, title_en').limit(30),
    supabase.from('projects').select('title_uz, title_en').limit(40),
  ])

  const pick = (a: string | null, b: string | null) => (uz ? a || b : b || a) || ''

  return renderSiteContext(
    {
      articles: (articles.data ?? []).map((a: any) => ({
        slug: a.slug,
        title: pick(a.title_uz, a.title_en),
        excerpt: pick(a.excerpt_uz, a.excerpt_en) || null,
        category: a.categories ? pick(a.categories.name_uz, a.categories.name_en) : null,
      })),
      quizzes: (quizzes.data ?? []).map((q: any) => ({
        title: pick(q.title_uz, q.title_en),
        difficulty: q.difficulty ?? null,
      })),
      hackathons: (hackathons.data ?? []).map((h: any) => ({ title: pick(h.title_uz, h.title_en) })),
      projects: (projects.data ?? []).map((p: any) => ({ title: pick(p.title_uz, p.title_en) })),
    },
    locale
  )
}

const ERRORS: Record<ChatErrorCode, { uz: string; en: string }> = {
  not_configured: {
    uz: 'Yordamchi hali sozlanmagan.',
    en: 'The assistant is not set up yet.',
  },
  busy: {
    uz: 'Yordamchi hozir band. Bir daqiqadan keyin urinib ko‘ring.',
    en: 'The assistant is busy. Please try again in a minute.',
  },
  unavailable: {
    uz: 'Yordamchi hozir ishlamayapti. Keyinroq urinib ko‘ring.',
    en: 'The assistant is unavailable right now. Please try again later.',
  },
  no_answer: {
    uz: 'Bunga javob bera olmadim. Savolni boshqacha yozib ko‘ring.',
    en: 'I could not answer that. Try rephrasing the question.',
  },
}

function errorText(code: ChatErrorCode, uz: boolean): string {
  return uz ? ERRORS[code].uz : ERRORS[code].en
}

export async function sendChatMessage(
  history: ChatTurn[],
  locale: string
): Promise<{ reply: string } | { error: string }> {
  const uz = locale !== 'en'

  const last = history[history.length - 1]
  if (!last || last.role !== 'user') {
    return { error: uz ? 'Xabar bo‘sh.' : 'Message is empty.' }
  }
  // A photo or voice note is a message on its own; only a turn with neither
  // text nor media is empty.
  if (!last.text.trim() && !last.attachment) {
    return { error: uz ? 'Xabar bo‘sh.' : 'Message is empty.' }
  }

  const kind = last.attachment?.kind ?? 'text'

  if (last.attachment) {
    const bytes = Math.floor((last.attachment.data.length * 3) / 4)
    const cap = kind === 'photo' ? MAX_PHOTO_BYTES : MAX_VOICE_BYTES
    if (bytes > cap) {
      return {
        error: uz
          ? 'Fayl juda katta. Kichikroq fayl yuboring.'
          : 'That file is too large. Please send a smaller one.',
      }
    }
    const allowedTypes = kind === 'photo' ? 'image/' : 'audio/'
    if (!last.attachment.mimeType.startsWith(allowedTypes)) {
      return { error: uz ? 'Bu fayl turi qo‘llab-quvvatlanmaydi.' : 'That file type is not supported.' }
    }
  }
  if (last.text.length > MAX_MESSAGE_CHARS) {
    return {
      error: uz
        ? `Xabar juda uzun (${MAX_MESSAGE_CHARS} belgidan kam bo‘lsin).`
        : `Message is too long (keep it under ${MAX_MESSAGE_CHARS} characters).`,
    }
  }

  const { allowed, reason } = await checkAndRecord(kind)
  if (!allowed) {
    if (reason === 'media') {
      return {
        error: uz
          ? kind === 'photo'
            ? 'Kuniga bitta rasm yuborish mumkin. Ertaga yana urinib ko‘ring.'
            : 'Kuniga ikkita ovozli xabar yuborish mumkin. Ertaga yana urinib ko‘ring.'
          : kind === 'photo'
            ? 'You can send one photo a day. Please try again tomorrow.'
            : 'You can send two voice messages a day. Please try again tomorrow.',
      }
    }
    return {
      error: uz
        ? 'Juda ko‘p savol yubordingiz. Bir ozdan keyin urinib ko‘ring.'
        : 'Too many messages. Please try again a little later.',
    }
  }

  // Trust only the shape, never the client's idea of how much history to send.
  const trimmed: ChatTurn[] = history
    .slice(-MAX_HISTORY)
    .filter((t) => (t.role === 'user' || t.role === 'model') && typeof t.text === 'string')
    .map((t, i, arr) => ({
      role: t.role,
      text: t.text.slice(0, MAX_MESSAGE_CHARS),
      // Only the turn being sent now keeps its attachment; replaying old
      // media every request would multiply the cost of a conversation.
      attachment: i === arr.length - 1 ? t.attachment : undefined,
    }))

  try {
    const catalogue = await loadCatalogue(locale)
    const reply = await askGemini({ history: trimmed, catalogue, locale })
    return { reply }
  } catch (e) {
    const code = e instanceof ChatError ? e.code : 'unavailable'
    return { error: errorText(code, uz) }
  }
}
