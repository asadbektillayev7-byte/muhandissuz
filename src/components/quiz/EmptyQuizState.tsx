'use client'
import { outline } from './surface'

export function EmptyQuizState({ locale, onReset }: { locale: string; onReset: () => void }) {
  const t =
    locale === 'uz'
      ? {
          title: 'Viktorina topilmadi',
          body: 'Boshqa yo‘nalish yoki tilni tanlab ko‘ring.',
          reset: 'Filtrlarni tozalash',
        }
      : {
          title: 'No quizzes found',
          body: 'Try another engineering field or language.',
          reset: 'Reset filters',
        }

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <svg
        viewBox="0 0 200 140"
        className="mb-6 h-32 w-44 text-muted-foreground"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
      >
        <defs>
          <pattern id="eq-grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0V12" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="200" height="140" fill="url(#eq-grid)" stroke="none" />
        <rect x="34" y="28" width="132" height="84" strokeWidth="1.5" opacity="0.6" rx="4" />
        <circle cx="100" cy="70" r="22" strokeWidth="1.5" opacity="0.7" />
        <path d="M116 86l18 18" strokeWidth="2.5" opacity="0.7" strokeLinecap="round" />
      </svg>

      <h3 className="text-lg font-semibold">{t.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 border border-border px-5 py-2 text-sm font-medium transition-colors duration-150 hover:border-chart-2 hover:text-chart-2"
        style={{ borderRadius: 999, ...outline }}
      >
        {t.reset}
      </button>
    </div>
  )
}
