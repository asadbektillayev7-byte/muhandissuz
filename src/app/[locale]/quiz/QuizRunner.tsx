'use client'

import { useState } from 'react'
import { field } from '@/lib/supabase/locale'

type Question = {
  id: number
  question_uz: string
  question_en: string | null
  image_url: string | null
  options_uz: string[]
  options_en: string[]
  correct_index: number
  explanation_uz: string | null
  explanation_en: string | null
}

// Fall back to Uzbek when an English option list is missing or incomplete.
function optionsFor(q: Question, locale: string): string[] {
  const uz = Array.isArray(q.options_uz) ? q.options_uz : []
  const en = Array.isArray(q.options_en) ? q.options_en : []
  if (locale !== 'uz' && en.length === uz.length && en.every((o) => o?.trim())) return en
  return uz
}

export function QuizRunner({ questions, locale }: { questions: Question[]; locale: string }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const t =
    locale === 'uz'
      ? {
          question: 'Savol',
          of: '/',
          next: 'Keyingi',
          finish: 'Yakunlash',
          correct: 'To\'g\'ri!',
          wrong: 'Noto\'g\'ri',
          result: 'Natija',
          again: 'Qaytadan',
        }
      : {
          question: 'Question',
          of: 'of',
          next: 'Next',
          finish: 'Finish',
          correct: 'Correct!',
          wrong: 'Incorrect',
          result: 'Result',
          again: 'Try again',
        }

  function restart() {
    setIndex(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }

  if (done) {
    return (
      <div className="border border-border p-8 text-center" style={{ borderRadius: 'var(--radius)' }}>
        <p className="text-sm text-muted-foreground mb-2">{t.result}</p>
        <p className="text-4xl font-bold mb-6">
          {score} <span className="text-muted-foreground text-2xl">/ {questions.length}</span>
        </p>
        <button
          onClick={restart}
          className="border border-border px-5 py-2 text-sm hover:bg-muted transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {t.again}
        </button>
      </div>
    )
  }

  const q = questions[index]
  const options = optionsFor(q, locale)
  const explanation = field(q, 'explanation', locale)
  const answered = picked !== null

  function pick(i: number) {
    if (answered) return
    setPicked(i)
    if (i === q.correct_index) setScore((s) => s + 1)
  }

  function advance() {
    if (index + 1 >= questions.length) return setDone(true)
    setIndex(index + 1)
    setPicked(null)
  }

  return (
    <div className="border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
      <p className="text-xs text-muted-foreground mb-3">
        {t.question} {index + 1} {t.of} {questions.length}
      </p>

      <h2 className="text-xl font-semibold mb-4">{field(q, 'question', locale)}</h2>

      {q.image_url && (
        <img
          src={q.image_url}
          alt=""
          className="max-h-72 w-auto mb-5 border border-border"
          style={{ borderRadius: 'var(--radius)' }}
        />
      )}

      <div className="space-y-2">
        {options.map((opt, i) => {
          const isCorrect = i === q.correct_index
          const isPicked = i === picked
          let cls = 'border-border hover:bg-muted'
          if (answered && isCorrect) cls = 'border-green-500 bg-green-500/10'
          else if (answered && isPicked) cls = 'border-red-500 bg-red-500/10'
          else if (answered) cls = 'border-border opacity-60'

          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={answered}
              className={`w-full text-left px-4 py-3 text-sm border transition-colors ${cls}`}
              style={{ borderRadius: 'var(--radius)' }}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="mt-5">
          <p
            className={`text-sm font-medium mb-1 ${
              picked === q.correct_index ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {picked === q.correct_index ? t.correct : t.wrong}
          </p>
          {explanation && <p className="text-sm text-muted-foreground">{explanation}</p>}

          <button
            onClick={advance}
            className="mt-4 bg-foreground text-background px-5 py-2 text-sm hover:opacity-90 transition-opacity"
            style={{ borderRadius: 'var(--radius)' }}
          >
            {index + 1 >= questions.length ? t.finish : t.next}
          </button>
        </div>
      )}
    </div>
  )
}
