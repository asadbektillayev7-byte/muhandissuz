'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { field } from '@/lib/supabase/locale'
import { effectiveDuration, type QuizWithMeta } from '@/lib/quiz'
import { DifficultyBadge } from './DifficultyBadge'
import { CategoryChip } from './CategoryChip'
import { QuizThumbnail } from './QuizThumbnail'
import { surface } from './surface'

export function QuizCard({ quiz, locale }: { quiz: QuizWithMeta; locale: string }) {
  const t =
    locale === 'uz'
      ? { q: 'savol', min: 'daq', based: 'Muhandiss maqolasi asosida', play: 'Boshlash' }
      : { q: 'questions', min: 'min', based: 'Based on Muhandiss articles', play: 'Start' }

  const minutes = effectiveDuration(quiz, quiz.questionCount)
  const title = field(quiz, 'title', locale)
  const description = field(quiz, 'description', locale)

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="h-full"
    >
      <Link
        href={`/${locale}/quiz/${quiz.slug}`}
        className="group flex h-full flex-col overflow-hidden border border-border bg-card transition-colors duration-150 hover:border-chart-2"
        style={{ borderRadius: 20, ...surface }}
      >
        <QuizThumbnail src={quiz.thumbnail_url} alt={title} category={quiz.categories?.slug} />

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {quiz.categories && (
              <CategoryChip as="span" label={field(quiz.categories, 'name', locale)} />
            )}
            <DifficultyBadge difficulty={quiz.difficulty} locale={locale} />
          </div>

          <h3 className="text-base font-semibold leading-snug">{title}</h3>

          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
          )}

          <div className="mt-3 text-xs text-muted-foreground">
            {quiz.questionCount} {t.q} · {minutes} {t.min}
          </div>

          {quiz.articleCount > 0 && (
            <div className="mt-1 text-xs text-muted-foreground/80">
              {quiz.articleCount} · {t.based}
            </div>
          )}

          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-chart-2">
            {t.play}
            <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
