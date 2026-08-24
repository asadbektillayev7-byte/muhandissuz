'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminSaveRecord } from '@/lib/actions'
import { ImageUpload } from '../ImageUpload'

type Option = { uz: string; en: string }

const input =
  'w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2'

function toOptions(item: any): Option[] {
  const uz: string[] = Array.isArray(item?.options_uz) ? item.options_uz : []
  const en: string[] = Array.isArray(item?.options_en) ? item.options_en : []
  const len = Math.max(uz.length, en.length, 4)
  return Array.from({ length: len }, (_, i) => ({ uz: uz[i] ?? '', en: en[i] ?? '' }))
}

export function QuestionForm({ quizId, item }: { quizId: number; item?: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [questionUz, setQuestionUz] = useState(item?.question_uz ?? '')
  const [questionEn, setQuestionEn] = useState(item?.question_en ?? '')
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '')
  const [options, setOptions] = useState<Option[]>(() => toOptions(item))
  const [correctIndex, setCorrectIndex] = useState<number>(item?.correct_index ?? 0)
  const [explanationUz, setExplanationUz] = useState(item?.explanation_uz ?? '')
  const [explanationEn, setExplanationEn] = useState(item?.explanation_en ?? '')
  const [sortOrder, setSortOrder] = useState<string>(item?.sort_order?.toString() ?? '0')

  function setOption(i: number, key: keyof Option, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, [key]: value } : o)))
  }

  function addOption() {
    if (options.length >= 6) return
    setOptions((prev) => [...prev, { uz: '', en: '' }])
  }

  function removeOption(i: number) {
    if (options.length <= 2) return
    setOptions((prev) => prev.filter((_, idx) => idx !== i))
    // Keep the correct answer pointing at the same option.
    if (correctIndex === i) setCorrectIndex(0)
    else if (correctIndex > i) setCorrectIndex(correctIndex - 1)
  }

  async function handleSave() {
    setError('')

    if (!questionUz.trim()) return setError('Savol (UZ) bo\'sh bo\'lmasligi kerak.')

    const filled = options.filter((o) => o.uz.trim())
    if (filled.length < 2) return setError('Kamida 2 ta javob variantini kiriting.')
    if (!options[correctIndex]?.uz.trim()) {
      return setError('To\'g\'ri javob bo\'sh variantga belgilangan. Boshqa variantni tanlang.')
    }

    // Drop trailing empty rows, keeping the correct answer aligned.
    const kept = options.filter((o, i) => o.uz.trim() || i === correctIndex)
    const newCorrect = kept.indexOf(options[correctIndex])

    setSaving(true)
    try {
      await adminSaveRecord(
        'quiz_questions',
        {
          quiz_id: quizId,
          question_uz: questionUz,
          question_en: questionEn || null,
          image_url: imageUrl || null,
          options_uz: kept.map((o) => o.uz),
          options_en: kept.map((o) => o.en),
          correct_index: newCorrect,
          explanation_uz: explanationUz || null,
          explanation_en: explanationEn || null,
          sort_order: Number(sortOrder) || 0,
        },
        item?.id,
      )
      router.push(`/admin/quiz/${quizId}`)
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
          <label className="block text-sm font-medium mb-1">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={input}
            style={{ borderRadius: 'var(--radius)' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Question (UZ) <span className="text-red-500">*</span>
        </label>
        <textarea
          value={questionUz}
          onChange={(e) => setQuestionUz(e.target.value)}
          rows={2}
          className={`${input} resize-none`}
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Question (EN)</label>
        <textarea
          value={questionEn}
          onChange={(e) => setQuestionEn(e.target.value)}
          rows={2}
          className={`${input} resize-none`}
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Image <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">
            Answers <span className="text-muted-foreground font-normal">
              — tick the correct one
            </span>
          </label>
          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= 6}
            className="text-xs text-chart-2 hover:underline disabled:opacity-40 disabled:no-underline"
          >
            + Add answer
          </button>
        </div>

        <div className="space-y-2">
          {options.map((o, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2 border ${
                correctIndex === i ? 'border-chart-2' : 'border-border'
              }`}
              style={{ borderRadius: 'var(--radius)' }}
            >
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                className="mt-2.5 shrink-0"
                title="Mark as correct answer"
              />
              <div className="flex-1 min-w-0 space-y-2">
                <input
                  value={o.uz}
                  onChange={(e) => setOption(i, 'uz', e.target.value)}
                  placeholder={`Javob ${i + 1} (UZ)`}
                  className={input}
                  style={{ borderRadius: 'var(--radius)' }}
                />
                <input
                  value={o.en}
                  onChange={(e) => setOption(i, 'en', e.target.value)}
                  placeholder={`Answer ${i + 1} (EN)`}
                  className={input}
                  style={{ borderRadius: 'var(--radius)' }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
                className="text-xs text-muted-foreground hover:text-red-500 px-1 mt-2 disabled:opacity-30"
                title="Remove this answer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Explanation (UZ){' '}
          <span className="text-muted-foreground font-normal">(shown after answering)</span>
        </label>
        <textarea
          value={explanationUz}
          onChange={(e) => setExplanationUz(e.target.value)}
          rows={2}
          className={`${input} resize-none`}
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Explanation (EN)</label>
        <textarea
          value={explanationEn}
          onChange={(e) => setExplanationEn(e.target.value)}
          rows={2}
          className={`${input} resize-none`}
          style={{ borderRadius: 'var(--radius)' }}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push(`/admin/quiz/${quizId}`)}
          className="border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-foreground text-background px-6 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {saving ? 'Saving...' : item?.id ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  )
}
