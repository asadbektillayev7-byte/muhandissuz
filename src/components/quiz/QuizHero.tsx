'use client'

import { motion } from 'framer-motion'

export function QuizHero({ locale }: { locale: string }) {
  const t =
    locale === 'uz'
      ? {
          title: 'Muhandislik Quizlari',
          subtitle:
            'Muhandiss maqolalari asosida tuzilgan quizlar orqali bilimingizni sinab ko‘ring.',
        }
      : {
          title: 'Engineering Quizzes',
          subtitle: 'Test your knowledge with quizzes created from Muhandiss articles.',
        }

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="mx-auto max-w-2xl py-10 text-center md:py-14"
    >
      <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">{t.title}</h1>
      <p className="mt-4 text-base text-muted-foreground">{t.subtitle}</p>
    </motion.header>
  )
}
