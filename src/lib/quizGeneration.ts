/**
 * Draft quiz questions from article text, using the Gemini API.
 *
 * Nothing here writes to the database. The caller gets drafts back, an admin
 * reviews them, and only what they approve is saved — so a hallucinated or
 * badly worded question never reaches the site on its own.
 */

/** Flash is plenty for this and keeps the free tier viable. Overridable in
 *  case the model line moves on again — 1.5 was retired, and so was 2.0. */
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash'

/** Enough article text for a good quiz without sending a whole book. */
const MAX_CHARS_PER_ARTICLE = 12_000

export type DraftQuestion = {
  question_uz: string
  question_en: string
  options_uz: string[]
  options_en: string[]
  correct_index: number
  explanation_uz: string
  explanation_en: string
}

type RichNode = {
  type?: string
  text?: string
  children?: RichNode[]
  [key: string]: unknown
}

/**
 * Article bodies are stored as a Lexical-style JSONB tree. Gemini only needs
 * the prose, so walk the tree and keep the text nodes, putting a blank line
 * between blocks so paragraphs do not run together.
 */
export function richTextToPlain(nodes: unknown): string {
  const out: string[] = []

  const walk = (node: RichNode) => {
    if (typeof node.text === 'string') out.push(node.text)
    if (Array.isArray(node.children)) {
      node.children.forEach(walk)
      // Block-level nodes end a line; inline nodes must not.
      if (node.type && node.type !== 'text' && node.type !== 'link') out.push('\n')
    }
  }

  if (Array.isArray(nodes)) (nodes as RichNode[]).forEach(walk)
  return out
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Matches the quiz_questions columns exactly, so an approved draft is a direct
 * insert. Gemini is asked for both languages because quizzes are bilingual
 * even though articles are Uzbek-only.
 */
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question_uz: { type: 'string' },
          question_en: { type: 'string' },
          options_uz: { type: 'array', items: { type: 'string' } },
          options_en: { type: 'array', items: { type: 'string' } },
          correct_index: { type: 'integer' },
          explanation_uz: { type: 'string' },
          explanation_en: { type: 'string' },
        },
        required: [
          'question_uz',
          'question_en',
          'options_uz',
          'options_en',
          'correct_index',
          'explanation_uz',
          'explanation_en',
        ],
      },
    },
  },
  required: ['questions'],
}

const SYSTEM_INSTRUCTION = `You write multiple-choice quiz questions for muhandiss.uz, an Uzbek engineering education platform.

Rules:
- Base every question strictly on the supplied article text. Never introduce facts that are not in it.
- Exactly 4 options per question. Exactly one is correct.
- correct_index is the 0-based position of the correct option.
- Wrong options must be plausible to someone who skimmed the article, not obviously silly.
- Vary which position holds the correct answer; do not always use the same index.
- Write the Uzbek fields in natural Uzbek and the English fields as a faithful translation of the same question. The two languages must have the same meaning and the same option order.
- explanation says why the correct option is right, in one or two sentences, citing the article's reasoning.
- Test understanding, not trivia: prefer "why" and "what happens if" over "which number was mentioned".`

/** Thrown for problems the admin can act on; the message is shown in the UI. */
export class QuizGenerationError extends Error {}

/** Trims a draft to what the schema allows and rejects anything malformed. */
function validate(raw: unknown): DraftQuestion[] {
  const list = (raw as { questions?: unknown })?.questions
  if (!Array.isArray(list)) {
    throw new QuizGenerationError('The model did not return a question list.')
  }

  const ok: DraftQuestion[] = []
  for (const q of list) {
    const opts_uz = Array.isArray(q?.options_uz) ? q.options_uz.filter((o: unknown) => typeof o === 'string') : []
    const opts_en = Array.isArray(q?.options_en) ? q.options_en.filter((o: unknown) => typeof o === 'string') : []
    const idx = Number(q?.correct_index)

    // Drop anything that would produce an unanswerable question rather than
    // saving a broken row and letting it surface on the live quiz.
    if (
      typeof q?.question_uz !== 'string' || !q.question_uz.trim() ||
      opts_uz.length < 2 ||
      !Number.isInteger(idx) || idx < 0 || idx >= opts_uz.length
    ) {
      continue
    }

    ok.push({
      question_uz: q.question_uz.trim(),
      question_en: typeof q.question_en === 'string' ? q.question_en.trim() : '',
      options_uz: opts_uz,
      // An English option list that does not line up with the Uzbek one would
      // mismatch correct_index, so it is dropped rather than half-used.
      options_en: opts_en.length === opts_uz.length ? opts_en : [],
      correct_index: idx,
      explanation_uz: typeof q.explanation_uz === 'string' ? q.explanation_uz.trim() : '',
      explanation_en: typeof q.explanation_en === 'string' ? q.explanation_en.trim() : '',
    })
  }

  if (ok.length === 0) {
    throw new QuizGenerationError('The model returned no usable questions. Try again, or pick a longer article.')
  }
  return ok
}

export async function generateQuestions({
  articles,
  count,
}: {
  articles: { title: string; body: string }[]
  count: number
}): Promise<DraftQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new QuizGenerationError(
      'GEMINI_API_KEY is not set. Add it in Vercel (and .env.local for local development).'
    )
  }

  const usable = articles.filter((a) => a.body.trim().length > 200)
  if (usable.length === 0) {
    throw new QuizGenerationError(
      'The linked articles have too little text to build a quiz from.'
    )
  }

  const source = usable
    .map((a) => `### ${a.title}\n\n${a.body.slice(0, MAX_CHARS_PER_ARTICLE)}`)
    .join('\n\n---\n\n')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Header rather than a query string, so the key cannot end up in a
        // proxy or server access log.
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Write exactly ${count} quiz questions from the article text below.\n\n${source}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    // The API key must never reach the admin's screen or the server log.
    const safe = detail.slice(0, 300).replace(apiKey, '[redacted]')
    throw new QuizGenerationError(`Gemini returned ${res.status}. ${safe}`)
  }

  const payload = await res.json()
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text !== 'string') {
    const reason = payload?.candidates?.[0]?.finishReason
    throw new QuizGenerationError(
      reason ? `Gemini stopped early (${reason}).` : 'Gemini returned an empty response.'
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new QuizGenerationError('Gemini returned malformed JSON.')
  }

  return validate(parsed)
}
