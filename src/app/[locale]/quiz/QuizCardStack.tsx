'use client'

import type { Category } from '../../../../payload-types'
import { MorphingCardStack, type CardData } from '@/components/ui/morphing-card-stack'
import { categoryMetaMap } from '@/lib/category-icons'

export function QuizCardStack({ categories, locale }: { categories: Category[]; locale: string }) {
  const cards: CardData[] = categories.map((cat) => {
    const meta = categoryMetaMap[cat.slug]
    return {
      id: cat.slug,
      title: typeof cat.name === 'string' ? cat.name : '',
      description: meta?.description[locale as 'uz' | 'en'] || '',
      icon: meta?.icon || null,
      href: `/${locale}/quiz/${cat.slug}`,
      ctaLabel: locale === 'uz' ? 'Testni boshlash' : 'Take the Quiz',
    }
  })

  return <MorphingCardStack cards={cards} defaultLayout="stack" />
}
