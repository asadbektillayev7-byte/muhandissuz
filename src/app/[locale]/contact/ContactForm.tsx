'use client'

import { useState } from 'react'

export function ContactForm({ locale }: { locale: string }) {
  const [submitted, setSubmitted] = useState(false)

  const labels = locale === 'uz' ? {
    name: 'Ismingiz',
    email: 'Emailingiz',
    message: 'Xabaringiz',
    send: 'Yuborish',
    sent: 'Xabaringiz yuborildi!',
  } : {
    name: 'Your Name',
    email: 'Your Email',
    message: 'Your Message',
    send: 'Send',
    sent: 'Message sent!',
  }

  if (submitted) {
    return (
      <p className="text-chart-2 font-medium">{labels.sent}</p>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">{labels.name}</label>
        <input type="text" className="w-full border border-border px-3 py-2 text-sm" style={{ borderRadius: 'var(--radius)' }} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{labels.email}</label>
        <input type="email" className="w-full border border-border px-3 py-2 text-sm" style={{ borderRadius: 'var(--radius)' }} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{labels.message}</label>
        <textarea rows={4} className="w-full border border-border px-3 py-2 text-sm" style={{ borderRadius: 'var(--radius)' }} required />
      </div>
      <button type="submit" className="bg-foreground text-background px-6 py-2 text-sm hover:opacity-90" style={{ borderRadius: 'var(--radius)' }}>
        {labels.send}
      </button>
    </form>
  )
}
