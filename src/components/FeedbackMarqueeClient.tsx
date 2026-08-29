'use client'

import { Marquee } from '@/components/ui/marquee'

type Item = { id: number; name: string; message: string }

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

function FeedbackCard({ item }: { item: Item }) {
  return (
    <div
      className="w-72 mx-3 select-none border p-4"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
        borderRadius: 12,
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
          {initials(item.name)}
        </div>
        <p className="truncate text-sm font-semibold">{item.name}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        &ldquo;{item.message}&rdquo;
      </p>
    </div>
  )
}

export function FeedbackMarqueeClient({ items, locale }: { items: Item[]; locale: string }) {
  const title = locale === 'uz' ? 'Foydalanuvchilar fikri' : 'What our community says'

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="font-display text-2xl font-semibold mb-6">{title}</h2>
      <Marquee direction="left" duration={60} pauseOnHover fade={true} fadeAmount={5}>
        {items.map((item) => (
          <FeedbackCard key={item.id} item={item} />
        ))}
      </Marquee>
    </section>
  )
}
