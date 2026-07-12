import type { Payload } from 'payload'

const categories = [
  { name: { uz: 'Mexanik Muhandislik', en: 'Mechanical Engineering' }, slug: 'mechanical-engineering', featured: true },
  { name: { uz: 'Robototexnika va Mexatronika', en: 'Robotics & Mechatronics' }, slug: 'robotics-mechatronics', featured: false },
  { name: { uz: 'Qurilish va Strukturaviy Muhandislik', en: 'Civil & Structural Engineering' }, slug: 'civil-structural', featured: false },
  { name: { uz: 'Elektr va Elektronika Muhandisligi', en: 'Electrical & Electronics Engineering' }, slug: 'electrical-electronics', featured: false },
  { name: { uz: 'Materialshunoslik', en: 'Materials Science' }, slug: 'materials-science', featured: false },
  { name: { uz: 'Aerokosmik Muhandislik', en: 'Aerospace Engineering' }, slug: 'aerospace-engineering', featured: false },
  { name: { uz: 'Avtomobilsozlik Muhandisligi', en: 'Automotive Engineering' }, slug: 'automotive-engineering', featured: false },
  { name: { uz: 'Energiya Tizimlari', en: 'Energy Systems' }, slug: 'energy-systems', featured: false },
  { name: { uz: 'Ishlab Chiqarish va CAD/CAM', en: 'Manufacturing & CAD/CAM' }, slug: 'manufacturing-cadcam', featured: false },
  { name: { uz: 'Biomedikal Muhandislik', en: 'Biomedical Engineering' }, slug: 'biomedical-engineering', featured: false },
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
