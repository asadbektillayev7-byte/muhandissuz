'use client'

import Link from 'next/link'
import { field } from '@/lib/supabase/locale'
import { effectiveDuration, type QuizWithMeta } from '@/lib/quiz'
import { CategoryChip } from './CategoryChip'
import { QuizThumbnail } from './QuizThumbnail'
import styles from './quiz-art.module.css'

export function QuizCard({ quiz, locale }: { quiz: QuizWithMeta; locale: string }) {
  const t =
    locale === 'uz'
      ? { q: 'savol', min: 'daq', based: 'Muhandiss maqolasi asosida', play: 'Boshlash' }
      : { q: 'questions', min: 'min', based: 'Based on Muhandiss articles', play: 'Start' }

  const minutes = effectiveDuration(quiz, quiz.questionCount)
  const title = field(quiz, 'title', locale)
  const description = field(quiz, 'description', locale)

  return (
    <Link
      href={`/${locale}/quiz/${quiz.slug}`}
      className={`group ${styles.card}`}
    >
      <QuizThumbnail src={quiz.thumbnail_url} alt={title} category={quiz.categories?.slug} />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {quiz.categories && (
            <CategoryChip as="span" label={field(quiz.categories, 'name', locale)} />
          )}
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

        <span className={`${styles.cardCta} mt-auto pt-5 text-sm font-semibold`}>
          {t.play}
          <span aria-hidden="true" className={styles.arrow}>→</span>
        </span>
      </div>
    </Link>
  )
}
