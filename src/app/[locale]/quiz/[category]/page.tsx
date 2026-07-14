import { getPayloadClient } from '@/utilities/getPayload'
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
  const name = typeof cat.name === 'string' ? cat.name : category

  const label = locale === 'uz'
    ? { title: `${name} — Test`, coming: 'Tez kunda', note: 'Savol-javoblar tayyorlanmoqda' }
    : { title: `${name} — Quiz`, coming: 'Coming soon', note: 'Questions and answers are being prepared' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">{label.title}</h1>
      <p className="text-lg text-muted-foreground mb-2">{label.coming}</p>
      <p className="text-sm text-muted-foreground/60">{label.note}</p>
    </div>
  )
}
