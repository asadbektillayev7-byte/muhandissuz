/** Expected save failures cross the Server Action boundary as data. Next.js
 * intentionally hides thrown server-error messages in production responses. */
export type SavedArticle = {
  id: number
  slug: string
  published: boolean
  published_date: string
}

export type ArticleSaveResult =
  | { ok: true; article: SavedArticle; warning?: string }
  | { ok: false; error: { code: string; message: string; reference?: string } }

export const ARTICLE_SAVE_MAX_BYTES = 2_000_000
