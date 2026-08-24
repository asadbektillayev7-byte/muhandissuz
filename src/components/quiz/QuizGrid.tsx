'use client'

import { motion } from 'framer-motion'
import type { QuizWithMeta } from '@/lib/quiz'
import { QuizCard } from './QuizCard'

export function QuizGrid({ quizzes, locale }: { quizzes: QuizWithMeta[]; locale: string }) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz, i) => (
        <motion.li
          key={quiz.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          // Staggered, but capped so a long list never crawls in.
          transition={{ duration: 0.22, ease: 'easeOut', delay: Math.min(i * 0.04, 0.24) }}
        >
          <QuizCard quiz={quiz} locale={locale} />
        </motion.li>
      ))}
    </ul>
  )
}
