'use client'

import { MorphingCardStack, type CardData } from '@/components/ui/morphing-card-stack'
import { categoryMetaMap } from '@/lib/category-icons'
import { field } from '@/lib/supabase/locale'

export function QuizCardStack({ categories, locale }: { categories: any[]; locale: string }) {
  const cards: CardData[] = categories.map((cat) => {
    const meta = categoryMetaMap[cat.slug]
    return {
      id: cat.slug,
      title: field(cat, 'name', locale),
      description: meta?.description[locale as 'uz' | 'en'] || '',
      icon: meta?.icon || null,
      href: `/${locale}/quiz/${cat.slug}`,
      ctaLabel: 'Take the Quiz',
    }
  })

  return <MorphingCardStack cards={cards} defaultLayout="stack" />
}
