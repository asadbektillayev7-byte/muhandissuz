import type { Payload } from 'payload'

const categories = [
  { name: { uz: 'Mexanika', en: 'Mechanical Engineering' }, slug: 'mechanical-engineering', featured: true },
  { name: { uz: 'Elektr', en: 'Electrical Engineering' }, slug: 'electrical-engineering', featured: false },
  { name: { uz: 'Kimyo', en: 'Chemical Engineering' }, slug: 'chemical-engineering', featured: false },
  { name: { uz: 'Motosport', en: 'Motorsports Engineering' }, slug: 'motorsports-engineering', featured: false },
  { name: { uz: 'Fuqarolik', en: 'Civil Engineering' }, slug: 'civil-engineering', featured: false },
  { name: { uz: 'Atrof-muhit', en: 'Environmental Engineering' }, slug: 'environmental-engineering', featured: false },
  { name: { uz: 'Sun\'iy intellekt', en: 'AI' }, slug: 'ai', featured: false },
]

export async function seedCategories(payload: Payload) {
  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'categories',
        data: {
          name: cat.name as any,
          slug: cat.slug,
          featured: cat.featured,
        },
      })
      console.log(`Created category: ${cat.slug}`)
    } else {
      console.log(`Category already exists: ${cat.slug}`)
    }
  }
}
