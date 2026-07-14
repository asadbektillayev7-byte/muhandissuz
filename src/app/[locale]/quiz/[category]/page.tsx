import { getPayloadClient } from '@/utilities/getPayload'
import { resolveLocalizedField } from '@/lib/locale'
import { notFound } from 'next/navigation'

export default async function CategoryQuizPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>
}) {
  const { locale, category } = await params
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: category } },
    locale: locale as 'uz' | 'en',
    limit: 1,
  })

  if (docs.length === 0) notFound()

  const cat = docs[0]
  const name = resolveLocalizedField(cat.name, locale) || category

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">{name} — Quiz</h1>
      <p className="text-lg text-muted-foreground mb-2">Coming soon</p>
      <p className="text-sm text-muted-foreground/60">Questions and answers are being prepared</p>
    </div>
  )
}
