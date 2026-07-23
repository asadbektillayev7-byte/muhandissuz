import { FeedbackForm } from '@/components/FeedbackForm'

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const content = locale === 'uz' ? {
    title: 'Baholash',
    subtitle: 'Muhandiss.uz haqida fikringizni bildiring',
  } : {
    title: 'Rate Us',
    subtitle: 'Tell us what you think of Muhandiss.uz',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
      <p className="text-muted-foreground mb-8">{content.subtitle}</p>

      <div className="border border-border p-6" style={{ borderRadius: 'var(--radius)' }}>
        <FeedbackForm locale={locale} />
      </div>
    </div>
  )
}
