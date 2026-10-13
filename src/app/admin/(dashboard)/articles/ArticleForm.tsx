'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { adminSaveArticle, adminCheckSlug } from '@/lib/actions'
import { TiptapEditor } from './TiptapEditor'
import { ImageUploadField } from '../ImageUploadField'
import { articleSlug, articleStatus, articleTags, fromTashkentInput, hasUnfinishedArticleImages, isArticleSlug, toTashkentInput, type ArticleLanguage, type ArticleStatus } from '@/lib/article-form'
import { hasArticleBody } from '@/lib/article-content'
import { ARTICLE_SAVE_MAX_BYTES } from '@/lib/article-save-result'

type Article = Record<string, any>
const languages = ['uz', 'en', 'ru'] as const
const inputClass = 'w-full min-w-0 border border-border rounded-md bg-background px-3 py-2 text-sm focus:border-chart-2'
const buttonClass = 'border border-border rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50'
const failure = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  // Framework and network errors can occur before the action returns its
  // structured result. Keep the draft and give the editor a useful next step.
  if (!message || /Server Components render|Failed to find Server Action|Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return "Server bilan bog'lanib bo'lmadi. Qayta urinib ko'ring. Sahifani yangilasangiz, mahalliy nusxani tiklang / Could not complete the save request. Retry, or reload and restore the local copy."
  }
  return message
}

function initialForm(article?: Article) {
  const values: Record<string, any> = {
    slug: article?.slug ?? '', category_id: article?.category_id ?? null, author_id: article?.author_id ?? null,
    translator_id: article?.translator_id ?? null, original_language: article?.original_language ?? 'uz',
    cover_image_url: article?.cover_image_url ?? '', og_image_url: article?.og_image_url ?? '',
    department_leader: article?.department_leader ?? '', editor: article?.editor ?? '',
    translator: article?.translator ?? '', researcher: article?.researcher ?? '',
    published_date: toTashkentInput(article?.published_date), status: articleStatus(article ?? {}),
    tags: articleTags(article?.tags).join(', '),
  }
  for (const locale of languages) {
    for (const field of ['title', 'excerpt', 'meta_description']) values[`${field}_${locale}`] = article?.[`${field}_${locale}`] ?? ''
    values[`body_${locale}`] = article?.[`body_${locale}`] ?? null
  }
  return values
}

export function ArticleForm({ article, categories, authors }: { article?: Article; categories: Article[]; authors: Article[] }) {
  const [form, setForm] = useState(() => initialForm(article))
  const [id, setId] = useState<number | undefined>(article?.id)
  const [language, setLanguage] = useState<ArticleLanguage>('uz')
  const [manualSlug, setManualSlug] = useState(Boolean(article?.id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState('')
  const [localStatus, setLocalStatus] = useState('')
  const [recovery, setRecovery] = useState<{ form: Record<string, any>; at: string } | null>(null)
  const [ready, setReady] = useState(false)
  const [uploads, setUploads] = useState({ pending: 0, failed: 0 })
  const [coverUploading, setCoverUploading] = useState(false)
  const [ogUploading, setOgUploading] = useState(false)
  const [slugMessage, setSlugMessage] = useState('')
  const [savedArticle, setSavedArticle] = useState<Article | null>(article ?? null)
  const initial = useRef(JSON.stringify(initialForm(article)))
  const current = useRef(form)
  const previewToken = useRef<string | null>(null)
  const recoveryKey = `muhandiss:article-draft:${id ?? 'new'}`
  const dirty = JSON.stringify(form) !== initial.current
  const busy = uploads.pending > 0 || coverUploading || ogUploading
  const unfinished = languages.some((lang) => hasUnfinishedArticleImages(form[`body_${lang}`]))
  current.current = form

  const change = useCallback((field: string, value: unknown) => {
    setForm((previous) => {
      const next = { ...previous, [field]: value }
      if (field === 'title_uz' && !manualSlug) next.slug = articleSlug(String(value))
      return next
    })
    setError('')
  }, [manualSlug])
  const updateBody = useCallback((value: unknown) => change(`body_${language}`, value), [change, language])
  const updateUploads = useCallback((value: { pending: number; failed: number }) => {
    setUploads((old) => old.pending === value.pending && old.failed === value.failed ? old : value)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(recoveryKey)
      if (raw) {
        const candidate = JSON.parse(raw)
        if (candidate?.version === 1 && candidate.form && typeof candidate.form === 'object' && JSON.stringify(candidate.form) !== initial.current) setRecovery(candidate)
      }
    } catch { setLocalStatus("Mahalliy nusxani o'qib bo'lmadi / Local recovery is unavailable.") }
    setReady(true)
    // Read recovery only when the article editor first opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ready || recovery) return
    const persist = () => {
      if (JSON.stringify(current.current) === initial.current) return
      try {
        const at = new Date().toISOString()
        localStorage.setItem(recoveryKey, JSON.stringify({ version: 1, form: current.current, at }))
        setLocalStatus(`Qurilmada saqlandi / Local recovery saved · ${new Date(at).toLocaleTimeString()}`)
      } catch { setLocalStatus("Qurilmada saqlash xatosi — maqolani saqlang / Local recovery failed; save your article.") }
    }
    const timer = window.setInterval(persist, 10_000)
    const onHidden = () => { if (document.visibilityState === 'hidden') persist() }
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (JSON.stringify(current.current) !== initial.current || busy) { persist(); event.preventDefault(); event.returnValue = '' }
    }
    const onLink = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.('a')
      if (!link || link.target === '_blank' || link.hasAttribute('download') || link.href === location.href || event.ctrlKey || event.metaKey) return
      if (JSON.stringify(current.current) !== initial.current && !window.confirm("Saqlanmagan o'zgarishlar bor. Sahifadan chiqasizmi? / Leave with unsaved changes?")) {
        event.preventDefault(); event.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', beforeUnload)
    // Next's history navigation may not unload the document. Preserve the
    // newest edits synchronously when Back/Forward fires, without trapping history.
    window.addEventListener('popstate', persist)
    window.addEventListener('pagehide', persist)
    document.addEventListener('visibilitychange', onHidden)
    document.addEventListener('click', onLink, true)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('beforeunload', beforeUnload)
      window.removeEventListener('popstate', persist)
      window.removeEventListener('pagehide', persist)
      document.removeEventListener('visibilitychange', onHidden)
      document.removeEventListener('click', onLink, true)
    }
  }, [ready, recovery, recoveryKey, busy])

  useEffect(() => {
    if (!form.slug) { setSlugMessage(''); return }
    if (!isArticleSlug(form.slug)) { setSlugMessage("Faqat kichik lotin harflari, raqam va tire / Use lowercase letters, numbers and hyphens."); return }
    let active = true
    const timer = window.setTimeout(async () => {
      try {
        const exists = await adminCheckSlug(form.slug, 'articles', id)
        if (active) setSlugMessage(exists ? 'Bu manzil band / This URL is already used.' : "Manzil mavjud / URL is available.")
      } catch { if (active) setSlugMessage("Manzilni tekshirib bo'lmadi; saqlashda qayta tekshiriladi / Checked again when saving.") }
    }, 500)
    return () => { active = false; window.clearTimeout(timer) }
  }, [form.slug, id])

  function payload(snapshot: Record<string, any>) {
    const { status, ...fields } = snapshot
    return { ...fields, published: status !== 'draft', published_date: fromTashkentInput(snapshot.published_date), tags: articleTags(snapshot.tags) }
  }

  const save = async () => {
    setError('')
    if (busy || unfinished) { setError("Rasmlarni yuklashni tugating yoki xatoli rasmlarni olib tashlang / Finish or remove unfinished images first."); return }
    if (!isArticleSlug(form.slug)) { setError("To'g'ri, bo'sh bo'lmagan manzil kiriting / Enter a valid article URL."); return }
    if (form.status !== 'draft' && (!form.title_uz.trim() || !hasArticleBody(form.body_uz))) { setError("Nashr qilish uchun o'zbekcha sarlavha va matn kerak / Uzbek title and body are needed to publish."); return }
    setSaving(true)
    const snapshot = { ...form }
    try {
      // ProseMirror retains null-prototype attribute objects in getJSON().
      // React turns those into opaque client references across Server Actions.
      // Normalize the full snapshot, including inactive languages, to plain JSON.
      const serialized = JSON.stringify(payload(snapshot))
      if (new TextEncoder().encode(serialized).byteLength > ARTICLE_SAVE_MAX_BYTES) throw new Error('Maqola juda katta (2 MB) / Article exceeds 2 MB. Upload images instead of embedding their data.')
      const data = JSON.parse(serialized) as ReturnType<typeof payload>
      if (snapshot.status === 'scheduled' && Date.parse(data.published_date) <= Date.now()) throw new Error('Rejalashtirish uchun kelajak vaqtini tanlang / Choose a future time for scheduling.')
      if (snapshot.status === 'published' && Date.parse(data.published_date) > Date.now()) throw new Error('Bu kelajak sanasi: Rejalashtirilgan holatini tanlang / Future date: choose Scheduled, or an earlier date.')
      const outcome = await adminSaveArticle(data, id)
      if (!outcome.ok) {
        const reference = outcome.error.reference ? ` (${outcome.error.reference})` : ''
        throw new Error(`${outcome.error.message}${reference}`)
      }
      const result = outcome.article
      setId(result.id)
      // A reload after the first save must reopen this article, rather than a
      // blank /new form. Updating history preserves edits made during the save.
      if (!id && window.location.pathname === '/admin/articles/new') window.history.replaceState(null, '', `/admin/articles/${result.id}`)
      setManualSlug(true)
      setSavedArticle({ ...data, id: result.id })
      initial.current = JSON.stringify(snapshot)
      setSavedAt(new Date().toLocaleTimeString())
      setLocalStatus(outcome.warning ?? '')
      try {
        const savedKey = `muhandiss:article-draft:${result.id}`
        if (JSON.stringify(current.current) !== initial.current) {
          // Editors can keep typing while the request is in flight. The save
          // only acknowledged snapshot; preserve their newer edits immediately.
          const at = new Date().toISOString()
          localStorage.setItem(savedKey, JSON.stringify({ version: 1, form: current.current, at }))
          if (savedKey !== recoveryKey) localStorage.removeItem(recoveryKey)
          setLocalStatus(`Yangi o'zgarishlar qurilmada saqlandi / Newer edits saved locally · ${new Date(at).toLocaleTimeString()}`)
        } else {
          localStorage.removeItem(recoveryKey)
          if (savedKey !== recoveryKey) localStorage.removeItem(savedKey)
        }
      } catch { setLocalStatus("Maqola saqlandi, lekin mahalliy nusxani yangilab bo'lmadi / Article saved; local recovery could not be updated.") }
    } catch (problem) {
      setError(failure(problem))
      // Save the latest edits immediately on failure, including typing that
      // happened during the request. Do not wait for the ten-second timer.
      try {
        localStorage.setItem(recoveryKey, JSON.stringify({ version: 1, form: current.current, at: new Date().toISOString() }))
        setLocalStatus("Oxirgi o'zgarishlar qurilmada saqlandi / Latest edits saved in local recovery.")
      } catch { setLocalStatus("Mahalliy nusxani saqlab bo'lmadi. Sahifani yopmang / Local recovery is unavailable; keep this page open.") }
    }
    finally { setSaving(false) }
  }

  const preview = () => {
    setError('')
    if (busy || unfinished) { setError("Ko'rishdan oldin rasmlarni yuklashni tugating / Finish the image uploads before previewing."); return }
    try {
      const now = Date.now()
      const prefix = 'muhandiss:article-preview:'
      const previousKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
        .filter((key): key is string => Boolean(key?.startsWith(prefix))).slice(0, 100)
      for (const key of previousKeys) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || 'null')
          if (!Number.isFinite(item?.expires) || item.expires <= now) localStorage.removeItem(key)
        } catch { localStorage.removeItem(key) }
      }
      // Reuse this form's slot, so repeated previews cannot consume one full
      // article's worth of browser storage on every click.
      const token = previewToken.current ?? crypto.randomUUID()
      previewToken.current = token
      localStorage.setItem(`${prefix}${token}`, JSON.stringify({ article: { ...payload({ ...form, published_date: form.published_date || toTashkentInput() }), id: id ?? 0, authors: authors.find((a) => a.id === form.author_id), categories: categories.find((c) => c.id === form.category_id) }, expires: now + 60 * 60 * 1000 }))
      window.open(`/${language}/article-preview?draft=${token}`, '_blank', 'noopener,noreferrer')
    } catch (problem) { setError(failure(problem)) }
  }

  const missingUz = !form.title_uz.trim() || !hasArticleBody(form.body_uz)
  const visibility = form.status === 'draft' ? 'Qoralama — saytda ochiq emas / Draft — not public.'
    : missingUz ? "O'zbekcha sarlavha yoki matn yetishmaydi / Missing Uzbek content."
      : form.status === 'scheduled' ? `Rejalashtirilgan / Scheduled for ${form.published_date.replace('T', ' ')} (Toshkent, UTC+5).`
        : !dirty && savedArticle ? 'Nashr etilgan — saytda ochiq / Published — visible on the site.' : 'Nashr etishga tayyor / Ready to publish.'
  const visibleSaved = savedArticle && articleStatus(savedArticle) === 'published'

  return <div className="space-y-5 min-w-0">
    {recovery && <div className="border border-amber-500/50 rounded-lg bg-amber-500/10 p-4 space-y-3" role="status">
      <p className="text-sm">Saqlanmagan nusxa topildi / A recovery copy was found ({new Date(recovery.at).toLocaleString()}). Yuklanmagan rasmlarni qayta tanlash kerak bo'lishi mumkin.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={() => { setForm({ ...initialForm(article), ...recovery.form }); setManualSlug(true); setRecovery(null) }}>Tiklash / Restore</button>
        <button type="button" className={buttonClass} onClick={() => { localStorage.removeItem(recoveryKey); setRecovery(null) }}>Nusxani o'chirish / Discard recovery</button>
      </div>
    </div>}
    <div className="border border-border rounded-lg p-3 space-y-2 text-sm bg-muted/30" aria-live="polite">
      <p>{visibility}</p>
      <p className="text-muted-foreground">{saving ? 'Saqlanmoqda / Saving…' : error ? 'Saqlash xatosi / Save failed' : dirty ? "Saqlanmagan o'zgarishlar / Unsaved changes" : savedAt ? `Saqlandi / Saved · ${savedAt}` : id ? 'Saqlangan maqola / Saved article' : 'Yangi qoralama / New draft'}</p>
      {localStatus && <p className="text-xs">{localStatus}</p>}
      {savedArticle && <a target="_blank" rel="noopener noreferrer" className="inline-block text-chart-2 hover:underline" href={`/uz/articles/${encodeURIComponent(savedArticle.slug)}`}>Saytda ko'rish / View on site{!visibleSaved ? ' (hali ochiq emas / not public yet)' : ''}</a>}
    </div>
    {error && <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Maqola tili / Article language">
      {languages.map((lang) => <button key={lang} type="button" role="tab" aria-selected={language === lang} disabled={busy} className={`${buttonClass} ${language === lang ? 'bg-foreground text-background hover:opacity-80' : ''}`} onClick={() => setLanguage(lang)}>{lang.toUpperCase()}{lang === 'uz' ? ' · Asosiy' : ' · Ixtiyoriy'}</button>)}
    </div>
    {language !== 'uz' && <p className="text-sm text-muted-foreground">Ixtiyoriy tarjima. Bo'sh qolsa, o'zbekcha matn ko'rsatiladi. / Optional translation; visitors see Uzbek when empty.</p>}
    <div className="space-y-4" lang={language} role="tabpanel">
      <label className="block text-sm font-medium">Sarlavha / Title ({language.toUpperCase()})<input className={`${inputClass} mt-1`} value={form[`title_${language}`]} onChange={(e) => change(`title_${language}`, e.target.value)} required={language === 'uz'} maxLength={300} /></label>
      <label className="block text-sm font-medium">Qisqa tavsif / Excerpt<textarea className={`${inputClass} mt-1 resize-y`} rows={3} value={form[`excerpt_${language}`]} maxLength={500} onChange={(e) => change(`excerpt_${language}`, e.target.value)} /><span className="text-xs text-muted-foreground">{form[`excerpt_${language}`].length}/500</span></label>
      <label className="block text-sm font-medium">Meta tavsif / Meta description<textarea className={`${inputClass} mt-1 resize-y`} rows={2} value={form[`meta_description_${language}`]} maxLength={160} onChange={(e) => change(`meta_description_${language}`, e.target.value)} /><span className="text-xs text-muted-foreground">{form[`meta_description_${language}`].length}/160</span></label>
      <div><p className="text-sm font-medium mb-2">Matn / Body</p><TiptapEditor key={language} language={language} content={form[`body_${language}`]} onChange={updateBody} onUploadStateChange={updateUploads} /></div>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <label className="block text-sm font-medium">Manzil / Slug<input className={`${inputClass} mt-1`} value={form.slug} onChange={(e) => { setManualSlug(true); change('slug', e.target.value) }} maxLength={180} /><span className="block mt-1 text-xs text-muted-foreground break-words">/uz/articles/{form.slug || '…'}</span><span className="block mt-1 text-xs" aria-live="polite">{slugMessage}</span><button type="button" className="mt-1 text-xs text-chart-2 hover:underline" onClick={() => { setManualSlug(false); change('slug', articleSlug(form.title_uz)) }}>Sarlavhadan yaratish / Generate from title</button></label>
      <label className="block text-sm font-medium">Kategoriya / Category<select className={`${inputClass} mt-1`} value={form.category_id ?? ''} onChange={(e) => change('category_id', e.target.value ? Number(e.target.value) : null)}><option value="">Tanlanmagan / None</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name_uz || item.name_en}</option>)}</select></label>
      <label className="block text-sm font-medium">Teglar / Tags<input className={`${inputClass} mt-1`} value={form.tags} onChange={(e) => change('tags', e.target.value)} placeholder="muhandislik, texnologiya" /><span className="text-xs text-muted-foreground">Vergul bilan ajrating / Separate with commas.</span></label>
      <label className="block text-sm font-medium">Muallif / Author<select className={`${inputClass} mt-1`} value={form.author_id ?? ''} onChange={(e) => change('author_id', e.target.value ? Number(e.target.value) : null)}><option value="">Tanlanmagan / None</option>{authors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </div>
    <ImageUploadField label="Muqova rasmi / Cover image" value={form.cover_image_url} onChange={(url) => change('cover_image_url', url)} onUploadStateChange={setCoverUploading} variant="cover" />
    <ImageUploadField label="Ulashish rasmi / OG image" helperText="Ixtiyoriy / Optional · 1200 × 630" value={form.og_image_url} onChange={(url) => change('og_image_url', url)} onUploadStateChange={setOgUploading} variant="og" />
    <details className="rounded-lg border border-border p-3"><summary className="cursor-pointer hover:text-chart-2 text-sm">Maqola ijodkorlari / Article credits · ixtiyoriy</summary><div className="grid sm:grid-cols-2 gap-3 mt-3">{[['department_leader', "Bo'lim rahbari / Department leader"], ['editor', 'Muharrir / Editor'], ['translator', 'Tarjimon / Translator'], ['researcher', 'Tadqiqotchi / Researcher']].map(([field, label]) => <label key={field} className="text-sm">{label}<input className={`${inputClass} mt-1`} value={form[field]} onChange={(e) => change(field, e.target.value)} maxLength={200} /></label>)}</div></details>
    <div className="grid sm:grid-cols-2 gap-4">
      <label className="block text-sm font-medium">Holat / Status<select className={`${inputClass} mt-1`} value={form.status} onChange={(e) => {
        const status = e.target.value as ArticleStatus
        change('status', status)
        if (status === 'published') {
          let date = NaN
          try { date = Date.parse(fromTashkentInput(form.published_date)) } catch { /* An empty or partial date is replaced with now. */ }
          if (!Number.isFinite(date) || date > Date.now()) change('published_date', toTashkentInput())
        }
      }}><option value="draft">Qoralama / Draft</option><option value="scheduled">Rejalashtirilgan / Scheduled</option><option value="published">Nashr etilgan / Published</option></select></label>
      <label className="block text-sm font-medium">Nashr sanasi / Publish date<input type="datetime-local" className={`${inputClass} mt-1`} value={form.published_date} onChange={(e) => change('published_date', e.target.value)} /><span className="text-xs text-muted-foreground">Toshkent (UTC+5)</span></label>
    </div>
    <div className="border border-border rounded-lg p-4 space-y-4">
      <p className="text-sm font-medium">Qidiruv va Telegram ko'rinishi / SEO preview</p>
      <div className="min-w-0"><p className="text-xs text-muted-foreground break-all">muhandiss.uz › {language} › articles › {form.slug}</p><p className="text-xl text-chart-2 break-words">{form[`title_${language}`] || form.title_uz || 'Sarlavha / Title'}</p><p className="text-sm text-muted-foreground break-words">{form[`meta_description_${language}`] || form[`excerpt_${language}`] || form.meta_description_uz || form.excerpt_uz}</p></div>
      <div className="border-l-4 border-chart-2 pl-3"><p className="text-xs text-muted-foreground">Muhandiss.uz · Telegram</p><p className="font-medium break-words">{form[`title_${language}`] || form.title_uz}</p>{(form.og_image_url || form.cover_image_url) && <img src={form.og_image_url || form.cover_image_url} alt="Ulashish rasmi / Sharing image" width={1200} height={630} className="mt-2 w-full max-w-sm rounded object-cover aspect-[1200/630]" loading="lazy" />}</div>
    </div>
    <div className="flex flex-wrap gap-3 sticky bottom-0 bg-background/95 backdrop-blur p-3 -mx-3 border-t border-border z-10">
      <Link href="/admin/articles" className={buttonClass}>Orqaga / Back</Link>
      <button type="button" className={buttonClass} onClick={preview} disabled={busy || unfinished}>Tashrifchi sifatida ko'rish / Preview as visitor</button>
      <button type="button" onClick={save} disabled={saving || busy || unfinished || Boolean(recovery)} className="rounded-md bg-foreground text-background px-5 py-2 text-sm hover:opacity-80 transition-opacity disabled:opacity-50">{saving ? 'Saqlanmoqda / Saving…' : 'Saqlash / Save'}</button>
    </div>
  </div>
}
