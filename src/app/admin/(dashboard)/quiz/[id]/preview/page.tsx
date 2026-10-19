import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { field } from '@/lib/supabase/locale'
import { effectiveDuration, type QuizQuestion } from '@/lib/quiz'
import { QuizRunner } from '@/app/[locale]/quiz/QuizRunner'
import { QuizThumbnail } from '@/components/quiz/QuizThumbnail'
import { CategoryChip } from '@/components/quiz/CategoryChip'
import styles from '@/components/quiz/quiz-player.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false } }

/** Authenticated preview reuses the visitor's player without publishing a draft. */
export default async function QuizPreviewPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const [{ id }, { lang }] = await Promise.all([params, searchParams])
  if (!/^\d+$/.test(id)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) notFound()

  const [{ data: quiz, error: quizError }, { data: questions, error: questionsError }] = await Promise.all([
    supabase.from('quizzes').select('*, categories(id, slug, name_uz, name_en)').eq('id', id).maybeSingle(),
    supabase.from('quiz_questions').select('*').eq('quiz_id', id).order('sort_order'),
  ])
  if (quizError || questionsError) throw new Error('Quiz preview could not be loaded.')
  if (!quiz) notFound()

  const locale = lang === 'en' ? 'en' : 'uz'
  const title = field(quiz, 'title', locale)
  const description = field(quiz, 'description', locale)
  const savedQuestions = (questions ?? []) as QuizQuestion[]

  return (
    <div className={styles.page}>
      <aside className="mb-6 border border-border p-4 text-sm" style={{ borderRadius: 'var(--radius)' }}>
        <p className="font-semibold">Ko‘rib chiqish / Admin preview</p>
        <p className="mt-1 text-muted-foreground">
          Saqlangan nusxa. Bu oynani ochish quizni nashr qilmaydi. / Saved version. Opening this preview does not publish the quiz.
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          <Link href={`/admin/quiz/${id}`} className="underline underline-offset-4 hover:opacity-70">Tahrirlash / Edit</Link>
          <Link href={`/admin/quiz/${id}/preview?lang=uz`} aria-current={locale === 'uz' ? 'page' : undefined} className="underline underline-offset-4 hover:opacity-70">O‘zbekcha</Link>
          <Link href={`/admin/quiz/${id}/preview?lang=en`} aria-current={locale === 'en' ? 'page' : undefined} className="underline underline-offset-4 hover:opacity-70">English</Link>
        </div>
      </aside>

      <div lang={locale}>
        <header className={styles.detailHeader}>
          <div>
            {quiz.categories && <div className="mb-3"><CategoryChip as="span" label={field(quiz.categories, 'name', locale)} /></div>}
            <h1 className={styles.detailTitle}>{title}</h1>
            {description && <p className={styles.detailDescription}>{description}</p>}
            <p className={styles.detailMeta}>
              {savedQuestions.length} {locale === 'uz' ? 'savol' : 'questions'} · {effectiveDuration(quiz, savedQuestions.length)} {locale === 'uz' ? 'daqiqa' : 'minutes'}
            </p>
          </div>
          <div className={styles.detailArt} aria-hidden="true">
            <QuizThumbnail src={quiz.thumbnail_url} alt="" category={quiz.categories?.slug} className="aspect-square" />
          </div>
        </header>

        {savedQuestions.length ? (
          <QuizRunner key={`${id}-${locale}`} questions={savedQuestions} locale={locale} />
        ) : (
          <p className="text-muted-foreground">Hali savollar yo‘q. Tahrirlash oynasida savollar qo‘shing. / No questions yet. Add them in the editor.</p>
        )}
      </div>
    </div>
  )
}
