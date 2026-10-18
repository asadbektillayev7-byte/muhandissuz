'use client'

import Link from 'next/link'
import { field } from '@/lib/supabase/locale'
import { effectiveDuration, type QuizWithMeta } from '@/lib/quiz'
import { DifficultyBadge } from './DifficultyBadge'
import { CategoryChip } from './CategoryChip'
import { QuizThumbnail } from './QuizThumbnail'
import styles from './quiz-art.module.css'

export function FeaturedQuiz({ quiz, locale }: { quiz: QuizWithMeta; locale: string }) {
  const t =
    locale === 'uz'
      ? {
          eyebrow: 'MURVACHCHA TAVSIYASI',
          q: 'savol',
          min: 'daqiqa',
          based: (n: number) => `${n} ta Muhandiss maqolasi asosida`,
          start: 'Boshlash',
        }
      : {
          eyebrow: 'MURVACHCHA’S PICK',
          q: 'questions',
          min: 'minutes',
          based: (n: number) => `Based on ${n} Muhandiss article${n === 1 ? '' : 's'}`,
          start: 'Start Quiz',
        }

  const minutes = effectiveDuration(quiz, quiz.questionCount)
  const title = field(quiz, 'title', locale)
  const description = field(quiz, 'description', locale)

  return (
    <Link
      href={`/${locale}/quiz/${quiz.slug}`}
      className={`group ${styles.featured}`}
    >
      <div className="flex flex-col justify-center p-6 md:p-8">
        <p className={`${styles.eyebrow} text-[11px] font-bold tracking-widest`}>{t.eyebrow}</p>

        <h2 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">{title}</h2>

        {description && <p className="mt-3 max-w-prose text-sm text-muted-foreground">{description}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {quiz.categories && (
            <CategoryChip as="span" label={field(quiz.categories, 'name', locale)} />
          )}
          <DifficultyBadge difficulty={quiz.difficulty} locale={locale} />
        </div>

        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
          <p>
            {quiz.questionCount} {t.q} · {minutes} {t.min}
          </p>
          {quiz.articleCount > 0 && <p>{t.based(quiz.articleCount)}</p>}
        </div>

        <span
          className={`${styles.start} mt-6 text-sm font-semibold`}
        >
          {t.start}
          <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
        </span>
      </div>

      <div className={styles.featuredVisual}>
        <QuizThumbnail src={quiz.thumbnail_url} alt={title} category={quiz.categories?.slug} className="h-full" featured locale={locale} />
      </div>
    </Link>
  )
}
