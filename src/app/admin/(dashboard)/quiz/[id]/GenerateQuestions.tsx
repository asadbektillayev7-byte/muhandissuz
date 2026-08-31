'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminGenerateQuizQuestions, adminSaveGeneratedQuestions } from '@/lib/actions'
import type { DraftQuestion } from '@/lib/quizGeneration'

/**
 * Drafts questions from the quiz's linked articles and shows them for review.
 * Nothing is written until the admin picks what to keep — the model is a
 * first draft, not the author.
 */
export function GenerateQuestions({
  quizId,
  articleCount,
}: {
  quizId: number
  articleCount: number
}) {
  const router = useRouter()
  const [count, setCount] = useState(5)
  const [drafts, setDrafts] = useState<DraftQuestion[] | null>(null)
  const [keep, setKeep] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setBusy(true)
    setError('')
    try {
      const result = await adminGenerateQuizQuestions(quizId, count)
      setDrafts(result)
      // Everything is kept by default; the admin unticks what they don't want.
      setKeep(new Set(result.map((_, i) => i)))
    } catch (e: any) {
      setError(e?.message || 'Generation failed.')
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!drafts) return
    setBusy(true)
    setError('')
    try {
      const chosen = drafts.filter((_, i) => keep.has(i))
      await adminSaveGeneratedQuestions(quizId, chosen)
      setDrafts(null)
      setKeep(new Set())
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Saving failed.')
    } finally {
      setBusy(false)
    }
  }

  function toggle(i: number) {
    setKeep((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (articleCount === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Link at least one article above to generate questions with AI.
      </p>
    )
  }

  return (
    <div className="border border-border p-4" style={{ borderRadius: 'var(--radius)' }}>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">How many questions</label>
          <input
            type="number"
            min={1}
            max={15}
            value={count}
            onChange={(e) => setCount(Math.min(15, Math.max(1, Number(e.target.value) || 1)))}
            className="border border-border bg-transparent px-3 py-2 text-sm w-24 focus:outline-none focus:border-chart-2"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="bg-foreground text-background px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {busy && !drafts ? 'Generating…' : 'Generate with AI'}
        </button>
        <span className="text-xs text-muted-foreground">
          From {articleCount} linked article{articleCount === 1 ? '' : 's'}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded mt-3">
          {error}
        </div>
      )}

      {drafts && (
        <div className="mt-5">
          <p className="text-sm font-semibold mb-1">
            {drafts.length} draft{drafts.length === 1 ? '' : 's'} — nothing is saved yet
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Untick anything wrong, then save. You can edit the wording afterwards with the
            normal question editor.
          </p>

          <ol className="space-y-3">
            {drafts.map((q, i) => (
              <li
                key={i}
                className="border border-border p-3"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keep.has(i)}
                    onChange={() => toggle(i)}
                    className="mt-1 shrink-0"
                  />
                  <span className="text-sm font-medium">{q.question_uz}</span>
                </label>

                <ul className="mt-2 ml-6 space-y-1">
                  {q.options_uz.map((opt, oi) => (
                    <li
                      key={oi}
                      className={
                        'text-xs ' +
                        (oi === q.correct_index
                          ? 'text-chart-2 font-medium'
                          : 'text-muted-foreground')
                      }
                    >
                      {oi === q.correct_index ? '✓ ' : '• '}
                      {opt}
                    </li>
                  ))}
                </ul>

                {q.explanation_uz && (
                  <p className="mt-2 ml-6 text-xs text-muted-foreground italic">
                    {q.explanation_uz}
                  </p>
                )}

                {q.options_en.length === 0 && (
                  <p className="mt-2 ml-6 text-xs text-muted-foreground">
                    No English version — add it in the editor if you want this bilingual.
                  </p>
                )}
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={save}
              disabled={busy || keep.size === 0}
              className="bg-foreground text-background px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
              style={{ borderRadius: 'var(--radius)' }}
            >
              {busy ? 'Saving…' : `Save ${keep.size} question${keep.size === 1 ? '' : 's'}`}
            </button>
            <button
              type="button"
              onClick={() => setDrafts(null)}
              disabled={busy}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
