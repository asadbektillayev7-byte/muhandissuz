/**
 * The site chat assistant.
 *
 * It does two jobs: guide visitors around Muhandiss.uz, and answer general
 * engineering questions. The first job is grounded in a snapshot of the real
 * catalogue so it cannot invent articles that do not exist; the second is the
 * model's own knowledge, which the prompt requires it to flag as such.
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'

/**
 * The public chat uses its own key, separate from the admin quiz generator.
 * If this one gets abused it can be revoked in AI Studio without taking the
 * admin tool down with it, and each key's usage is visible separately.
 * Falls back to the shared key so the widget still works before the second
 * key exists.
 */
function chatApiKey(): string | undefined {
  return process.env.GEMINI_CHAT_API_KEY || process.env.GEMINI_API_KEY
}

/** The assistant is named per language, not translated on the fly. */
export const BOT_NAME_UZ = 'Murvatcha'
export const BOT_NAME_EN = 'The Fixy'

export function botName(locale: string): string {
  return locale === 'en' ? BOT_NAME_EN : BOT_NAME_UZ
}

/** Kept short: a chat reply should read like a person, not a brochure. */
const MAX_OUTPUT_TOKENS = 500

/** Long enough for a real question, short enough to bound the cost. */
export const MAX_MESSAGE_CHARS = 800

/** How much history is sent back. Older turns are dropped, oldest first. */
export const MAX_HISTORY = 12

export type ChatTurn = { role: 'user' | 'model'; text: string }

export type ChatErrorCode = 'not_configured' | 'busy' | 'unavailable' | 'no_answer'

/** Carries a code, not a sentence: the wording is chosen per locale by the
 *  caller, so a visitor reading Uzbek never gets an English error. */
export class ChatError extends Error {
  constructor(public code: ChatErrorCode) {
    super(code)
  }
}

export type SiteContext = {
  articles: { title: string; excerpt: string | null; category: string | null; slug: string }[]
  quizzes: { title: string; difficulty: string | null }[]
  hackathons: { title: string }[]
  projects: { title: string }[]
}

/**
 * The catalogue as a compact block of text. Titles and excerpts only — enough
 * to point someone at the right page without pretending to know the contents
 * of articles that have not been written yet.
 */
export function renderSiteContext(ctx: SiteContext, locale: string): string {
  const lines: string[] = []

  if (ctx.articles.length) {
    lines.push('ARTICLES (title — category — excerpt — url path):')
    for (const a of ctx.articles) {
      lines.push(
        `- ${a.title}${a.category ? ` — ${a.category}` : ''}${
          a.excerpt ? ` — ${a.excerpt}` : ''
        } — /${locale}/articles/${a.slug}`
      )
    }
  }
  if (ctx.quizzes.length) {
    lines.push('', 'QUIZZES:')
    for (const q of ctx.quizzes) lines.push(`- ${q.title}${q.difficulty ? ` (${q.difficulty})` : ''}`)
  }
  if (ctx.hackathons.length) {
    lines.push('', 'HACKATHONS:')
    for (const h of ctx.hackathons) lines.push(`- ${h.title}`)
  }
  if (ctx.projects.length) {
    lines.push('', 'STUDENT PROJECTS:')
    for (const p of ctx.projects) lines.push(`- ${p.title}`)
  }

  return lines.join('\n')
}

export function buildSystemInstruction(catalogue: string, locale: string): string {
  const name = botName(locale)
  const language =
    locale === 'en'
      ? 'Reply in English unless the visitor writes in Uzbek, in which case reply in Uzbek.'
      : 'Reply in Uzbek unless the visitor writes in English, in which case reply in English.'

  return `You are ${name}, the assistant on muhandiss.uz, an open engineering platform in Uzbek for students and young engineers.

You do two things:
1. Help visitors find their way around the site — which articles exist, what the quizzes and hackathons are, where to submit a project.
2. Answer general engineering and technology questions.

${language}

Rules:
- Keep answers short. Two or three sentences is usually right. Never write an essay.
- When recommending something on the site, use only the catalogue below. Never invent an article, quiz or hackathon that is not listed, and never invent a URL.
- The catalogue gives titles and short excerpts only. You have NOT read the full articles, so do not claim to summarise their contents — point the visitor to the page instead.
- When answering from your own engineering knowledge rather than from the site, answer normally but do not attribute it to Muhandiss.uz.
- If you do not know something, say so plainly.
- You are not a person. If asked, say you are ${name}, an AI assistant for this site.
- Stay on engineering, technology, and this site. If asked about something unrelated, say that is outside what you can help with and offer what you can do instead.

SITE CATALOGUE
${catalogue || '(The catalogue is empty right now.)'}`
}

export async function askGemini({
  history,
  catalogue,
  locale,
}: {
  history: ChatTurn[]
  catalogue: string
  locale: string
}): Promise<string> {
  const apiKey = chatApiKey()
  if (!apiKey) throw new ChatError('not_configured')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemInstruction(catalogue, locale) }],
        },
        contents: history.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      }),
    }
  )

  if (!res.ok) {
    // The response body can echo the request; never let it reach the visitor.
    throw new ChatError(res.status === 429 ? 'busy' : 'unavailable')
  }

  const payload = await res.json()
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text !== 'string' || !text.trim()) {
    throw new ChatError('no_answer')
  }
  return text.trim()
}
