'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminSaveRecord, adminSetQuizArticles } from '@/lib/actions'
import { ImageUpload } from '../ImageUpload'
import { DIFFICULTIES, DIFFICULTY_LABELS } from '@/lib/quiz'

const input =
  'w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

export function QuizMetaForm({
  categories,
  articles,
  item,
  linkedArticleIds = [],
}: {
  categories: any[]
  articles: any[]
  item?: any
  linkedArticleIds?: number[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [titleUz, setTitleUz] = useState(item?.title_uz ?? '')
  const [titleEn, setTitleEn] = useState(item?.title_en ?? '')
  const [slug, setSlug] = useState(item?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(item?.slug))
  const [descUz, setDescUz] = useState(item?.description_uz ?? '')
  const [descEn, setDescEn] = useState(item?.description_en ?? '')
  const [categoryId, setCategoryId] = useState<string>(item?.category_id?.toString() ?? '')
  const [difficulty, setDifficulty] = useState(item?.difficulty ?? 'easy')
  const [duration, setDuration] = useState<string>(item?.duration_minutes?.toString() ?? '')
  const [thumb, setThumb] = useState(item?.thumbnail_url ?? '')
  const [published, setPublished] = useState<boolean>(item?.published ?? true)
  const [linked, setLinked] = useState<number[]>(linkedArticleIds)

  function onTitle(v: string) {
    setTitleUz(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  function toggleArticle(id: number) {
    setLinked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSave() {
    setError('')
    if (!titleUz.trim()) return setError('Sarlavha (UZ) bo\'sh bo\'lmasligi kerak.')
    if (!slug.trim()) return setError('Slug bo\'sh bo\'lmasligi kerak.')

    setSaving(true)
    try {
      const saved = await adminSaveRecord(
        'quizzes',
        {
          slug: slug.trim(),
          title_uz: titleUz,
          title_en: titleEn || null,
          description_uz: descUz || null,
          description_en: descEn || null,
          category_id: categoryId ? Number(categoryId) : null,
          difficulty,
          duration_minutes: duration ? Number(duration) : null,
          thumbnail_url: thumb || null,
          published,
        },
        item?.id,
      )

      const quizId = item?.id ?? (Array.isArray(saved) ? saved[0]?.id : undefined)
      if (quizId) await adminSetQuizArticles(Number(quizId), linked)

      router.push(quizId ? `/admin/quiz/${quizId}` : '/admin/quiz')
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Saqlashda xatolik')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Title (UZ) <span className="text-red-500">*</span>
          </label>
          <input value={titleUz} onChange={(e) => onTitle(e.target.value)} className={input} style={{ borderRadius: 'var(--radius)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title (EN)</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={input} style={{ borderRadius: 'var(--radius)' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }}
            className={input}
            style={{ borderRadius: 'var(--radius)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={input} style={{ borderRadius: 'var(--radius)' }}>
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_uz} / {c.name_en}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (UZ)</label>
        <textarea value={descUz} onChange={(e) => setDescUz(e.target.value)} rows={2} className={`${input} resize-none`} style={{ borderRadius: 'var(--radius)' }} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (EN)</label>
        <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} className={`${input} resize-none`} style={{ borderRadius: 'var(--radius)' }} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={input} style={{ borderRadius: 'var(--radius)' }}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d].en} / {DIFFICULTY_LABELS[d].uz}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Duration <span className="text-muted-foreground font-normal">(min)</span>
          </label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="auto" className={input} style={{ borderRadius: 'var(--radius)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Published</label>
          <label className="flex items-center gap-2 text-sm h-[38px]">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span className="text-muted-foreground">Visible on the site</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Thumbnail <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <ImageUpload value={thumb} onChange={setThumb} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Based on articles{' '}
          <span className="text-muted-foreground font-normal">
            — {linked.length} selected, shown on the quiz card
          </span>
        </label>
        <div className="border border-border max-h-56 overflow-y-auto p-2 space-y-1" style={{ borderRadius: 'var(--radius)' }}>
          {articles.map((a) => (
            <label key={a.id} className="flex items-start gap-2 text-sm p-1 hover:bg-muted cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
              <input type="checkbox" className="mt-1" checked={linked.includes(a.id)} onChange={() => toggleArticle(a.id)} />
              <span>{a.title_uz}</span>
            </label>
          ))}
          {articles.length === 0 && (
            <p className="text-sm text-muted-foreground p-2">No articles yet.</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => router.push('/admin/quiz')} className="border border-border px-4 py-2 text-sm hover:bg-muted transition-colors" style={{ borderRadius: 'var(--radius)' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="bg-foreground text-background px-6 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50" style={{ borderRadius: 'var(--radius)' }}>
          {saving ? 'Saving...' : item?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}
