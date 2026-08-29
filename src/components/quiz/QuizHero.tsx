'use client'

import { motion } from 'framer-motion'
import { PointerHighlight } from '@/components/ui/pointer-highlight'

export function QuizHero({ locale }: { locale: string }) {
  const t =
    locale === 'uz'
      ? {
          titleLead: 'Muhandislik',
          titleHighlight: 'Quizlari',
          subtitle:
            'Muhandiss maqolalari asosida tuzilgan quizlar orqali bilimingizni sinab ko‘ring.',
        }
      : {
          titleLead: 'Engineering',
          titleHighlight: 'Quizzes',
          subtitle: 'Test your knowledge with quizzes created from Muhandiss articles.',
        }

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="mx-auto max-w-2xl py-10 text-center md:py-14"
    >
      {/* Extra bottom room: the pointer settles ~24px past the rectangle's
          bottom edge, which without this would land exactly on the subtitle. */}
      <h1 className="font-display flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 pb-6 text-4xl font-bold leading-tight md:text-5xl">
        <span>{t.titleLead}</span>
        <PointerHighlight
          containerClassName="inline-block"
          rectangleClassName="rounded-sm"
        >
          <span className="px-1">{t.titleHighlight}</span>
        </PointerHighlight>
      </h1>
      <p className="mt-4 text-base text-muted-foreground">{t.subtitle}</p>
    </motion.header>
  )
}
