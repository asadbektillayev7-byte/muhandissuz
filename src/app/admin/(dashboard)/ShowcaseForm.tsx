'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, RotateCcw, Trash2 } from 'lucide-react'
import { adminSaveHackathonPhotos, adminSaveRecord } from '@/lib/actions'
import { readArray, type GalleryPhoto } from '@/lib/showcase'
import { dateInputToISOString, dateInputValue } from '@/lib/showcase-date'
import { getVideoValidationError, parseVideoUrl } from '@/lib/video'
import { SHOWCASE_IMAGE_ACCEPT, uploadShowcaseImage } from '@/lib/showcase-upload'
import { HackathonPhotosField, type GalleryUploadStatus } from './HackathonPhotosField'

type Category = { id: number | string; name_uz: string; name_en?: string }
type RecordItem = Record<string, unknown> & { id?: number | string }
const inputStyle = 'w-full rounded border border-border bg-background px-3 py-2 text-sm'
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded border border-border px-3 py-2 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'

function textValue(item: RecordItem | undefined, name: string) {
  const value = item?.[name]
  return value == null ? '' : String(value)
}

function validDate(value: string) {
  return dateInputToISOString(value) !== null
}

function initialMedia(item: RecordItem | undefined, isHackathon: boolean) {
  const cover = textValue(item, 'cover_image_url')
  const legacyVideo = parseVideoUrl(cover) ? cover : ''
  const images = readArray(item?.images) as { url?: unknown }[]
  const firstImage = images.find((image) => typeof image?.url === 'string')
  return {
    video_url: textValue(item, 'video_url') || legacyVideo,
    cover_image_url: (legacyVideo ? '' : cover) || (!isHackathon && typeof firstImage?.url === 'string' ? firstImage.url : ''),
  }
}

export function ShowcaseForm({
  kind,
  item,
  photos: initialPhotos = [],
  photosError,
  categories = [],
}: {
  kind: 'hackathon' | 'project'
  item?: RecordItem
  photos?: GalleryPhoto[]
  photosError?: string
  categories?: Category[]
}) {
  const isHackathon = kind === 'hackathon'
  const destination = isHackathon ? '/admin/hackathons' : '/admin/projects'
  const router = useRouter()
  const [recordId, setRecordId] = useState(item?.id)
  const [form, setForm] = useState(() => ({
    title_uz: textValue(item, 'title_uz'),
    title_en: textValue(item, 'title_en'),
    slug: textValue(item, 'slug'),
    summary_uz: textValue(item, 'summary_uz'),
    summary_en: textValue(item, 'summary_en'),
    status: textValue(item, 'status') || (isHackathon ? 'upcoming' : item ? '' : 'past'),
    date_range_start: dateInputValue(textValue(item, 'date_range_start')),
    date_range_end: dateInputValue(textValue(item, 'date_range_end')),
    ...initialMedia(item, isHackathon),
    age_group: textValue(item, 'age_group'),
    category_id: textValue(item, 'category_id'),
  }))
  const [photos, setPhotos] = useState(initialPhotos)
  const [galleryStatus, setGalleryStatus] = useState<GalleryUploadStatus>({ busy: false, hasErrors: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [coverBusy, setCoverBusy] = useState(false)
  const [coverProgress, setCoverProgress] = useState(0)
  const [coverError, setCoverError] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const coverPicker = useRef<HTMLInputElement>(null)
  const coverRequest = useRef<AbortController | null>(null)
  const previewRef = useRef('')
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      coverRequest.current?.abort()
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  function change(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function uploadCover(file: File) {
    setCoverFile(file)
    setCoverError('')
    setCoverBusy(true)
    setCoverProgress(0)
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = URL.createObjectURL(file)
    setCoverPreview(previewRef.current)
    const controller = new AbortController()
    coverRequest.current = controller
    try {
      const url = await uploadShowcaseImage(file, 'covers', (progress) => {
        if (mounted.current) setCoverProgress(progress)
      }, controller.signal)
      if (mounted.current) {
        change('cover_image_url', url)
        setCoverFile(null)
      }
    } catch (uploadError: unknown) {
      if (mounted.current) setCoverError(uploadError instanceof Error ? uploadError.message : 'Yuklash amalga oshmadi. / Upload failed.')
    } finally {
      if (mounted.current) setCoverBusy(false)
      if (coverPicker.current) coverPicker.current.value = ''
    }
  }

  function removeCover() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = ''
    setCoverPreview('')
    setCoverFile(null)
    setCoverError('')
    change('cover_image_url', '')
  }

  const videoError = getVideoValidationError(form.video_url, form.cover_image_url)
  const parsedVideo = parseVideoUrl(form.video_url)
  const poster = coverPreview || form.cover_image_url || parsedVideo?.posterUrl
  const busy = coverBusy || galleryStatus.busy
  const hasUploadErrors = Boolean(coverError) || galleryStatus.hasErrors

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || busy || hasUploadErrors || photosError) return
    setError('')
    if (!form.title_uz.trim() || !form.slug.trim()) {
      setError("O'zbekcha sarlavha va sahifa manzilini kiriting. / Enter an Uzbek title and page slug.")
      return
    }
    if (videoError) {
      setError(videoError)
      return
    }
    if ((isHackathon && !form.date_range_start) || (form.date_range_start && !validDate(form.date_range_start)) || (form.date_range_end && !validDate(form.date_range_end))) {
      setError("To'g'ri sanani tanlang. / Choose a valid date.")
      return
    }
    if (isHackathon && form.date_range_end && form.date_range_end < form.date_range_start) {
      setError("Tugash sanasi boshlanish sanasidan oldin bo'lmasin. / The end date must be on or after the start date.")
      return
    }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        title_uz: form.title_uz.trim(),
        title_en: form.title_en.trim() || form.title_uz.trim(),
        slug: form.slug.trim(),
        status: form.status || null,
        date_range_start: dateInputToISOString(form.date_range_start),
        video_url: form.video_url.trim() || null,
        cover_image_url: form.cover_image_url || null,
      }
      if (isHackathon) {
        data.summary_uz = form.summary_uz.trim() || null
        data.summary_en = form.summary_en.trim() || form.summary_uz.trim() || null
        data.date_range_end = dateInputToISOString(form.date_range_end)
      } else {
        data.age_group = form.age_group.trim() || null
        data.category_id = form.category_id ? Number(form.category_id) : null
      }

      const saved = await adminSaveRecord(isHackathon ? 'hackathons' : 'student_projects', data, recordId)
      const savedId = saved?.[0]?.id ?? recordId
      if (savedId == null) throw new Error('Saqlangan yozuv topilmadi. / Could not find the saved record.')
      // A gallery failure must retry this record, never create a second one.
      setRecordId(savedId)
      if (isHackathon) await adminSaveHackathonPhotos(savedId, photos)
      router.push(destination)
      router.refresh()
    } catch (saveError: unknown) {
      const message = saveError instanceof Error ? saveError.message : 'Saqlash amalga oshmadi. / Save failed.'
      const schemaHint = /schema cache|column .*does not exist|hackathon_photos|replace_hackathon_photos/i.test(message)
        ? ' Supabase migration_v12.sql faylini ishga tushiring. / Run Supabase migration_v12.sql.' : ''
      setError(message + schemaHint)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <fieldset disabled={saving} className="space-y-6">
        {error && <p role="alert" className="rounded border border-destructive bg-card p-3 text-sm text-destructive">{error}</p>}
        {photosError && (
          <p role="alert" className="rounded border border-destructive bg-card p-3 text-sm text-destructive">
            Rasmlar ro'yxati yuklanmadi. Supabase migration_v12.sql faylini ishga tushiring va sahifani yangilang.
            {' / '}Photos could not be loaded. Run Supabase migration_v12.sql and refresh this page. {photosError}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="showcase-title-uz" className="mb-1 block text-sm font-medium">Sarlavha (UZ) / Title (UZ) <span aria-hidden="true" className="text-destructive">*</span></label>
            <input id="showcase-title-uz" className={inputStyle} required value={form.title_uz} onChange={(event) => change('title_uz', event.target.value)} />
          </div>
          <div>
            <label htmlFor="showcase-title-en" className="mb-1 block text-sm font-medium">Sarlavha (EN, ixtiyoriy) / Title (EN, optional)</label>
            <input id="showcase-title-en" className={inputStyle} value={form.title_en} onChange={(event) => change('title_en', event.target.value)} aria-describedby="showcase-translation-hint" />
          </div>
        </div>
        <p id="showcase-translation-hint" className="text-xs text-muted-foreground">Inglizcha matn bo'sh bo'lsa, o'zbekcha matn ko'rsatiladi. / Empty English fields use the Uzbek text.</p>
        <div>
          <label htmlFor="showcase-slug" className="mb-1 block text-sm font-medium">Sahifa manzili / Slug <span aria-hidden="true" className="text-destructive">*</span></label>
          <input id="showcase-slug" className={inputStyle} required value={form.slug} onChange={(event) => change('slug', event.target.value)} />
        </div>
        {isHackathon && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="showcase-summary-uz" className="mb-1 block text-sm font-medium">Qisqacha (UZ) / Summary (UZ)</label>
              <textarea id="showcase-summary-uz" rows={3} className={inputStyle} value={form.summary_uz} onChange={(event) => change('summary_uz', event.target.value)} />
            </div>
            <div>
              <label htmlFor="showcase-summary-en" className="mb-1 block text-sm font-medium">Qisqacha (EN, ixtiyoriy) / Summary (EN, optional)</label>
              <textarea id="showcase-summary-en" rows={3} className={inputStyle} value={form.summary_en} onChange={(event) => change('summary_en', event.target.value)} />
            </div>
          </div>
        )}
        <div className={`grid gap-4 ${isHackathon ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <div>
            <label htmlFor="showcase-status" className="mb-1 block text-sm font-medium">Holat / Status</label>
            <select id="showcase-status" className={inputStyle} value={form.status} onChange={(event) => change('status', event.target.value)}>
              {!isHackathon && <option value="">Belgilanmagan / Unspecified</option>}
              <option value="upcoming">Kutilmoqda / Upcoming</option>
              <option value="ongoing">Davom etmoqda / Ongoing</option>
              <option value="past">Yakunlangan / Past</option>
            </select>
          </div>
          <div>
            <label htmlFor="showcase-start" className="mb-1 block text-sm font-medium">{isHackathon ? 'Boshlanish sanasi / Start date *' : 'Sana (ixtiyoriy) / Date (optional)'}</label>
            <input id="showcase-start" type="date" required={isHackathon} className={inputStyle} value={form.date_range_start} onChange={(event) => change('date_range_start', event.target.value)} />
          </div>
          {isHackathon && (
            <div>
              <label htmlFor="showcase-end" className="mb-1 block text-sm font-medium">Tugash sanasi / End date</label>
              <input id="showcase-end" type="date" min={form.date_range_start || undefined} className={inputStyle} value={form.date_range_end} onChange={(event) => change('date_range_end', event.target.value)} />
            </div>
          )}
        </div>
        {!isHackathon && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="showcase-age-group" className="mb-1 block text-sm font-medium">Yosh guruhi / Age group</label>
              <input id="showcase-age-group" className={inputStyle} value={form.age_group} onChange={(event) => change('age_group', event.target.value)} />
            </div>
            <div>
              <label htmlFor="showcase-category" className="mb-1 block text-sm font-medium">Yo'nalish / Category</label>
              <select id="showcase-category" className={inputStyle} value={form.category_id} onChange={(event) => change('category_id', event.target.value)}>
                <option value="">Tanlanmagan / None</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name_uz || category.name_en}</option>)}
              </select>
            </div>
          </div>
        )}
        <section className="space-y-4 border-t border-border pt-6" aria-labelledby="showcase-video-heading">
          <h2 id="showcase-video-heading" className="text-lg font-semibold">Video va muqova / Video and cover</h2>
          <div>
            <label htmlFor="showcase-video-url" className="mb-1 block text-sm font-medium">Video havolasi (ixtiyoriy) / Video link (optional)</label>
            <input id="showcase-video-url" type="url" className={inputStyle} value={form.video_url} onChange={(event) => change('video_url', event.target.value)} placeholder="https://www.youtube.com/watch?v=…" aria-describedby="showcase-video-hint showcase-drive-hint showcase-video-error" aria-invalid={Boolean(videoError)} />
            <p id="showcase-video-hint" className="mt-2 text-xs text-muted-foreground">YouTube: watch, youtu.be, shorts, embed. Google Drive: /file/d/…/view yoki /open?id=…</p>
            <p id="showcase-drive-hint" className="mt-1 text-sm text-muted-foreground">Google Drive uchun muqova rasmini yuklang va faylni “Anyone with the link” qilib ulashing. / For Drive, upload a cover and share the file as “Anyone with the link”.</p>
            <p id="showcase-video-error" className="mt-2 text-sm text-destructive" role={videoError ? 'alert' : undefined}>{videoError}</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">Muqova rasmi / Cover image</p>
            {poster && <img src={poster} alt={form.title_uz || 'Video muqovasi / Video cover'} width={640} height={360} className="aspect-video w-full max-w-sm rounded border border-border object-cover" />}
            {!form.cover_image_url && !coverPreview && parsedVideo?.posterUrl && <p className="text-xs text-muted-foreground">YouTube muqovasi avtomatik olinadi. / The YouTube thumbnail is used automatically.</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondaryButton} disabled={coverBusy} onClick={() => coverPicker.current?.click()}><ImagePlus size={16} /> Muqova yuklash / Upload cover</button>
              {(form.cover_image_url || coverPreview || coverError) && <button type="button" className={`${secondaryButton} hover:text-destructive`} disabled={coverBusy} onClick={removeCover}><Trash2 size={16} /> O'chirish / Remove</button>}
              {coverError && coverFile && <button type="button" className={secondaryButton} disabled={coverBusy} onClick={() => uploadCover(coverFile)}><RotateCcw size={16} /> Qayta urinish / Retry</button>}
            </div>
            <input ref={coverPicker} type="file" accept={SHOWCASE_IMAGE_ACCEPT} className="hidden" aria-label="Muqova rasmini tanlang / Choose a cover image" disabled={coverBusy} onChange={(event) => { if (event.target.files?.[0]) void uploadCover(event.target.files[0]) }} />
            {coverBusy && <div role="status" className="max-w-sm space-y-1"><p className="text-xs">Muqova yuklanmoqda / Uploading cover: {coverProgress}%</p><progress value={coverProgress} max={100} className="h-2 w-full accent-accent" aria-label="Muqova yuklanishi / Cover upload progress" /></div>}
            {coverError && <p role="alert" className="text-sm text-destructive">{coverError}</p>}
          </div>
        </section>
        {isHackathon && !photosError && <HackathonPhotosField initialPhotos={initialPhotos} onChange={setPhotos} onStatusChange={setGalleryStatus} disabled={saving} />}
        {busy && <p role="status" className="text-sm text-muted-foreground">Rasmlar yuklanishini kuting. / Wait for the image uploads to finish.</p>}
        <div className="flex flex-wrap gap-3 border-t border-border pt-4">
          <button type="button" className={secondaryButton} disabled={saving || busy} onClick={() => router.push(destination)}>Bekor qilish / Cancel</button>
          <button type="submit" disabled={saving || busy || hasUploadErrors || Boolean(photosError)} className="rounded bg-foreground px-6 py-2 text-sm text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Saqlanmoqda… / Saving…' : recordId ? 'Saqlash / Update' : 'Yaratish / Create'}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
