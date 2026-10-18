'use client'

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import { field } from '@/lib/supabase/locale'
import { MurvachchaMascot } from '@/components/MurvachchaMascot'
import styles from '@/components/quiz/quiz-player.module.css'

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

// Deterministic trajectories keep the burst light and hydration-safe.
const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
  '--confetti-x': `${(i * 47) % 260 - 65}px`,
  '--confetti-rise': `${-70 - (i * 31) % 100}px`,
  '--confetti-spin': `${(i % 2 ? 1 : -1) * (180 + i * 29)}deg`,
  '--confetti-delay': `${(i % 5) * 35}ms`,
  '--confetti-colour': ['#a77bf3', '#e9b638', '#3bbda9', '#f58c83', '#64bde8'][i % 5],
}) as CSSProperties)

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
  const titleId = useId()
  const player = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const moveFocus = useRef(false)

  useEffect(() => {
    // Leave initial page focus alone; announce the new view after Next/Retry.
    if (moveFocus.current) {
      heading.current?.focus({ preventScroll: true })
      player.current?.scrollIntoView({ block: 'start' })
      moveFocus.current = false
    }
  }, [index, done])

  const t = locale === 'uz'
    ? {
        question: 'Savol', of: '/', next: 'Keyingi savol', finish: 'Natijani ko‘rish',
        correct: 'Zo‘r! To‘g‘ri topding.', wrong: 'Yaxshi urinish! Sababini birga ko‘ramiz.',
        correctAnswer: 'To‘g‘ri javob', yourAnswer: 'Sizning javobingiz',
        correctCount: 'to‘g‘ri', progress: 'Javob berilgan savollar',
        choose: 'Bitta javobni tanlang', hint: 'Shoshilmay o‘yla. Birga topamiz!',
        result: 'QUIZ YAKUNLANDI', again: 'Qayta urinib ko‘rish', all: 'Barcha quizlar',
        perfect: 'Ajoyib! Barchasini topding.', good: 'Zo‘r harakat! Davom etamizmi?',
        learning: 'Har bir urinish — yangi bilim.',
        resultHint: 'Bilimingni yana bir bor sinab ko‘r yoki yangi mavzuni tanla.',
        correctTotal: 'To‘g‘ri javoblar', revisit: 'Yana mashq qilamiz', accuracy: 'Aniqlik',
      }
    : {
        question: 'Question', of: 'of', next: 'Next question', finish: 'See results',
        correct: 'Nice work! You got it.', wrong: 'Good try! Let’s see why.',
        correctAnswer: 'Correct answer', yourAnswer: 'Your answer',
        correctCount: 'correct', progress: 'Questions answered',
        choose: 'Choose one answer', hint: 'Take your time. Let’s figure it out!',
        result: 'QUIZ COMPLETE', again: 'Try again', all: 'All quizzes',
        perfect: 'Brilliant! You got them all.', good: 'Great effort! Ready for more?',
        learning: 'Every attempt teaches you something.',
        resultHint: 'Give it another go or explore a new topic.',
        correctTotal: 'Correct answers', revisit: 'To practise again', accuracy: 'Accuracy',
      }

  function restart() {
    moveFocus.current = true
    setIndex(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }

  if (!questions.length) return null

  if (done) {
    const percent = Math.round((score / questions.length) * 100)
    const perfect = score === questions.length
    const encouragement = perfect ? t.perfect : percent >= 50 ? t.good : t.learning
    return (
      <section ref={player} className={`${styles.player} ${styles.result}`} aria-labelledby={titleId}>
        <div className={styles.resultTop}>
          <p className={styles.eyebrow}><span aria-hidden="true">✦</span> {t.result}</p>
          <div className={styles.scoreScene}>
            {perfect && (
              <span className={styles.confetti} aria-hidden="true">
                {confettiPieces.map((style, i) => <span key={i} style={style} />)}
              </span>
            )}
            <span className={styles.resultSpark} aria-hidden="true">✦</span>
            <div className={styles.scoreRing} style={{ '--score-angle': `${percent * 3.6}deg` } as CSSProperties}>
              <div className={styles.scoreCentre}>
                <p className={styles.scoreValue}>{score}<span> / {questions.length}</span></p>
                <p className={styles.scoreLabel}>{t.correctTotal}</p>
              </div>
            </div>
            <span className={`${styles.resultMascot} ${perfect ? styles.celebrating : ''}`}><MurvachchaMascot state="greeting" /></span>
            <span className={styles.resultSparkSmall} aria-hidden="true">✦</span>
          </div>
          <h2 ref={heading} id={titleId} tabIndex={-1} className={styles.resultTitle}>{encouragement}</h2>
          <p className={styles.resultHint}>{t.resultHint}</p>
        </div>
        <div className={styles.resultBottom}>
          <dl className={styles.resultStats}>
            <div><dt>{t.accuracy}</dt><dd>{percent}%</dd></div>
            <div><dt>{t.revisit}</dt><dd>{questions.length - score}</dd></div>
          </dl>
          <div className={styles.resultActions}>
            <button type="button" onClick={restart} className={styles.primaryButton}>
              <RotateCcw size={17} aria-hidden="true" /> {t.again}
            </button>
            <Link href={`/${locale}/quiz`} className={styles.secondaryButton}>
              {t.all} <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const q = questions[index]
  const options = optionsFor(q, locale)
  const explanation = field(q, 'explanation', locale)
  const answered = picked !== null
  const correct = picked === q.correct_index
  const completed = index + (answered ? 1 : 0)

  function pick(i: number) {
    if (answered) return
    setPicked(i)
    if (i === q.correct_index) setScore((s) => s + 1)
  }

  function advance() {
    moveFocus.current = true
    if (index + 1 >= questions.length) return setDone(true)
    setIndex(index + 1)
    setPicked(null)
  }

  return (
    <section ref={player} className={styles.player} aria-labelledby={titleId}>
      <div className={styles.progressHeader}>
        <div className={styles.progressLabels}>
          <span className={styles.questionCounter}>{t.question} {index + 1} {t.of} {questions.length}</span>
          <span className={styles.correctCounter}><Check size={15} aria-hidden="true" /> {score} {t.correctCount}</span>
        </div>
        <div className={styles.progressTrack} role="progressbar" aria-label={t.progress} aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={completed}>
          <span style={{ width: `${(completed / questions.length) * 100}%` }} />
        </div>
      </div>
      <div className={styles.questionBody}>
        <p className={styles.instruction}>{t.choose}</p>
        <h2 ref={heading} id={titleId} tabIndex={-1} className={styles.questionTitle}>{field(q, 'question', locale)}</h2>
        {q.image_url && (
          <div className={styles.questionImage}>
            <img src={q.image_url} alt={field(q, 'question', locale)} decoding="async" />
          </div>
        )}
        <div className={styles.options} role="group" aria-labelledby={titleId}>
          {options.map((opt, i) => {
            const isCorrect = i === q.correct_index
            const isPicked = i === picked
            const state = answered ? isCorrect ? 'correct' : isPicked ? 'wrong' : 'muted' : 'ready'
            return (
              <button
                type="button" key={`${q.id}-${i}`} onClick={() => pick(i)} disabled={answered}
                aria-pressed={isPicked} className={styles.option} data-state={state}
              >
                <span className={styles.optionLetter} aria-hidden="true">
                  {answered && isCorrect ? <Check size={20} /> : answered && isPicked ? <X size={20} /> : String.fromCharCode(65 + i)}
                </span>
                <span className={styles.optionContent}>
                  <span>{opt}</span>
                  {answered && (isCorrect || isPicked) && (
                    <span className={styles.answerLabel}>{isCorrect ? t.correctAnswer : t.yourAnswer}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className={styles.feedbackArea} data-state={answered ? correct ? 'correct' : 'wrong' : 'ready'}>
        <div className={styles.coach}>
          <span className={styles.coachMascot}>
            <MurvachchaMascot state={answered ? correct ? 'greeting' : 'thinking' : 'listening'} />
          </span>
          <div className={styles.coachText} role="status" aria-atomic="true">
            <span className={styles.coachName}>Murvachcha</span>
            <p className={styles.feedbackTitle}>{answered ? correct ? t.correct : t.wrong : t.hint}</p>
            {answered && explanation && <p className={styles.explanation}>{explanation}</p>}
          </div>
        </div>
        {answered && (
          <div className={styles.nextRow}>
            <button type="button" onClick={advance} className={styles.primaryButton}>
              {index + 1 >= questions.length ? t.finish : t.next} <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
