'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 transition-colors hover:text-chart-2"
        >
          <Star
            className="h-6 w-6"
            fill={star <= value ? 'currentColor' : 'none'}
            strokeWidth={star <= value ? 1.5 : 2}
          />
        </button>
      ))}
    </div>
  )
}

export function FeedbackForm({ locale }: { locale: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [rating, setRating] = useState(0)

  const labels = locale === 'uz' ? {
    name: 'Ismingiz',
    rating: 'Baholang',
    message: 'Fikringiz',
    send: 'Yuborish',
    sent: 'Fikringiz uchun rahmat!',
    sentSub: 'Sizning bahoyingiz biz uchun muhim.',
    namePlaceholder: 'Ismingizni kiriting',
    messagePlaceholder: 'Fikringizni yozing...',
  } : {
    name: 'Name',
    rating: 'Rating',
    message: 'Message',
    send: 'Send',
    sent: 'Thanks for your feedback!',
    sentSub: 'Your rating helps us improve.',
    namePlaceholder: 'Enter your name',
    messagePlaceholder: 'Write your message...',
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(false)
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      rating,
      message: formData.get('message') as string,
    }
    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('feedback')
        .insert(data)
      if (insertError) throw insertError
      setSubmitted(true)
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <Star className="h-10 w-10 mx-auto mb-3 text-chart-2" fill="currentColor" strokeWidth={1.5} />
        <p className="text-lg font-semibold text-chart-2">{labels.sent}</p>
        <p className="text-sm text-muted-foreground mt-1">{labels.sentSub}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5">{labels.name}</label>
        <input
          name="name"
          type="text"
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2 transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
          placeholder={labels.namePlaceholder}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{labels.rating}</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">{labels.message}</label>
        <textarea
          name="message"
          rows={4}
          className="w-full border border-border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:border-chart-2 transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
          placeholder={labels.messagePlaceholder}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {locale === 'uz' ? 'Xatolik yuz berdi. Qayta urinib ko\'ring.' : 'Something went wrong. Please try again.'}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="bg-foreground text-background px-6 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {submitting ? (locale === 'uz' ? 'Yuborilmoqda...' : 'Sending...') : labels.send}
      </button>
    </form>
  )
}
