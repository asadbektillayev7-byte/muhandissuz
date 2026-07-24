import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = process.env.ADMIN_EMAIL

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE env vars — run via Supabase SQL Editor instead: supabase/seed-articles.sql')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const categories = [
  { name_uz: 'Mexanika', name_en: 'Mechanical Engineering', slug: 'mechanical-engineering', color: '#3b82f6' },
  { name_uz: 'Elektr', name_en: 'Electrical Engineering', slug: 'electrical-engineering', color: '#f59e0b' },
  { name_uz: 'Kimyo', name_en: 'Chemical Engineering', slug: 'chemical-engineering', color: '#10b981' },
  { name_uz: 'Motosport', name_en: 'Motorsports Engineering', slug: 'motorsports-engineering', color: '#ef4444' },
  { name_uz: 'Fuqarolik', name_en: 'Civil Engineering', slug: 'civil-engineering', color: '#8b5cf6' },
  { name_uz: 'Atrofmuhit', name_en: 'Environmental Engineering', slug: 'environmental-engineering', color: '#22c55e' },
  { name_uz: 'Suniy intellekt', name_en: 'AI', slug: 'ai', color: '#ec4899' },
]

const articles = [
  // Mechanical Engineering
  { title_uz: 'Tishli gildiraklar va reduktorlar: Mashinalarda quvvat uzatish',
    title_en: 'Gears and Gearboxes: Power Transmission in Machines',
    slug: 'gears-and-gearboxes', category_slug: 'mechanical-engineering',
    excerpt_uz: 'Mexanik uzatmalar turlari, tishli gildiraklarning geometriyasi va reduktorlarni loyihalash asoslari.',
    excerpt_en: 'Types of mechanical drives, gear geometry, and gearbox design fundamentals.',
    cover_image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80' },

  { title_uz: 'Ichki yonuv dvigatellarining termodinamikasi',
    title_en: 'Thermodynamics of Internal Combustion Engines',
    slug: 'thermodynamics-ic-engines', category_slug: 'mechanical-engineering',
    excerpt_uz: 'Otto va Diesel sikllari, issiqlik samaradorligi va dvigatel konstruksiyasiga termodinamik yondashuv.',
    excerpt_en: 'Otto and Diesel cycles, thermal efficiency, and thermodynamic approach to engine design.',
    cover_image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80' },

  // Electrical Engineering
  { title_uz: 'Yangi boshlovchilar uchun PCB dizayn asoslari',
    title_en: 'PCB Design Fundamentals for Beginners',
    slug: 'pcb-design-basics', category_slug: 'electrical-engineering',
    excerpt_uz: 'Printed circuit board yaratish bosqichlari: sxemadan tortib routing va manufacturingacha.',
    excerpt_en: 'PCB creation steps: from schematic to routing and manufacturing.',
    cover_image_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80' },

  { title_uz: 'Elektr dvigatellarni tushunish: DC dan Steppergacha',
    title_en: 'Understanding Electric Motors: From DC to Stepper',
    slug: 'electric-motors-dc-stepper', category_slug: 'electrical-engineering',
    excerpt_uz: 'Elektr dvigatellarining ishlash prinsipi, turlari va ularni boshqarish usullari.',
    excerpt_en: 'Operating principles of electric motors, types, and control methods.',
    cover_image_url: 'https://images.unsplash.com/photo-1563770551464-0c9fc0a5ca88?w=800&q=80' },

  // Chemical Engineering
  { title_uz: 'Sanoatda kimyoviy jarayonlarni optimallashtirish',
    title_en: 'Chemical Process Optimization in Industry',
    slug: 'chemical-process-optimization', category_slug: 'chemical-engineering',
    excerpt_uz: 'Reaktor dizayni, modda balansi va sanoat kimyoviy jarayonlarini samaradorligini oshirish usullari.',
    excerpt_en: 'Reactor design, mass balance, and methods to improve industrial chemical process efficiency.',
    cover_image_url: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80' },

  { title_uz: 'Polimer muhandisligiga kirish',
    title_en: 'Introduction to Polymer Engineering',
    slug: 'polymer-engineering-intro', category_slug: 'chemical-engineering',
    excerpt_uz: 'Polimerlar turlari, ularning xossalari va sanoatda qo\'llanilishi haqida umumiy ma\'lumot.',
    excerpt_en: 'Types of polymers, their properties, and industrial applications.',
    cover_image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80' },

  // Motorsports Engineering
  { title_uz: 'Formula 1 aerodinamikasi: Downforce qanday ishlaydi',
    title_en: 'Aerodynamics in Formula 1: How Downforce Works',
    slug: 'f1-aerodynamics-downforce', category_slug: 'motorsports-engineering',
    excerpt_uz: 'Ground effect, diffuzorlar va antikrillar yordamida avtomobilni yerga bosish kuchini oshirish.',
    excerpt_en: 'Increasing downforce through ground effect, diffusers, and wings.',
    cover_image_url: 'https://images.unsplash.com/photo-1599813390210-8c351f812e65?w=800&q=80' },

  { title_uz: 'Podveska geometriyasi va avtomobil dinamikasi',
    title_en: 'Suspension Geometry and Vehicle Dynamics',
    slug: 'suspension-geometry-dynamics', category_slug: 'motorsports-engineering',
    excerpt_uz: 'Camber, caster va toe burchaklarining avtomobil boshqaruviga ta\'siri.',
    excerpt_en: 'How camber, caster, and toe angles affect vehicle handling.',
    cover_image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80' },

  // Civil Engineering
  { title_uz: 'Koprik dizayn prinsiplari: Rim arkalaridan tortilgan kopriklargacha',
    title_en: 'Bridge Design Principles: From Roman Arches to Cable-Stayed',
    slug: 'bridge-design-principles', category_slug: 'civil-engineering',
    excerpt_uz: 'Turli koprik turlari, ularning konstruktiv xususiyatlari va yuk taqsimoti prinsiplari.',
    excerpt_en: 'Different bridge types, their structural characteristics, and load distribution principles.',
    cover_image_url: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80' },

  { title_uz: 'Zilzilabardosh binolarni loyihalash',
    title_en: 'Earthquake-Resistant Building Design',
    slug: 'earthquake-resistant-design', category_slug: 'civil-engineering',
    excerpt_uz: 'Seysmik zonalarda binolarni mustahkamlash usullari va zamonaviy konstruktiv yechimlar.',
    excerpt_en: 'Methods for reinforcing buildings in seismic zones and modern structural solutions.',
    cover_image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80' },

  // Environmental Engineering
  { title_uz: 'Qayta tiklanadigan energiya tizimlari: Quyosh va shamol integratsiyasi',
    title_en: 'Renewable Energy Systems: Solar and Wind Integration',
    slug: 'renewable-energy-solar-wind', category_slug: 'environmental-engineering',
    excerpt_uz: 'Quyosh panellari va shamol turbinalarini elektr tarmogiga integratsiya qilish texnologiyalari.',
    excerpt_en: 'Technologies for integrating solar panels and wind turbines into the power grid.',
    cover_image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80' },

  { title_uz: 'Oqova suvlarni tozalash texnologiyalari',
    title_en: 'Wastewater Treatment Technologies',
    slug: 'wastewater-treatment-tech', category_slug: 'environmental-engineering',
    excerpt_uz: 'Membran bioreaktorlar, aktivated loy va boshqa zamonaviy tozalash usullari haqida.',
    excerpt_en: 'Membrane bioreactors, activated sludge, and other modern treatment methods.',
    cover_image_url: 'https://images.unsplash.com/photo-1466611653917-95081537e5b7?w=800&q=80' },

  // AI
  { title_uz: 'Tasvirni aniqlash uchun neyron tarmoqlar',
    title_en: 'Neural Networks for Image Recognition',
    slug: 'neural-networks-image-recognition', category_slug: 'ai',
    excerpt_uz: 'Convolutional neyron tarmoqlar (CNN) yordamida tasvirlarni klassifikatsiya qilish asoslari.',
    excerpt_en: 'Fundamentals of image classification using Convolutional Neural Networks (CNNs).',
    cover_image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80' },

  { title_uz: 'Katta til modellari: GPT qanday ishlaydi',
    title_en: 'Large Language Models: How GPT Works',
    slug: 'large-language-models-gpt', category_slug: 'ai',
    excerpt_uz: 'Transformer arxitekturasi, attention mexanizmi va generativ modellarning ishlash prinsipi.',
    excerpt_en: 'Transformer architecture, attention mechanism, and how generative models work.',
    cover_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
]

async function seed() {
  console.log('Seeding demo articles...\n')

  // 1. Create demo author
  const { data: author, error: authorErr } = await supabase
    .from('authors')
    .insert({ name: 'Demo Content', bio_uz: 'Demo maqolalar', bio_en: 'Demo articles', role: 'author' })
    .select()
    .single()

  if (authorErr && !authorErr.message.includes('duplicate')) {
    console.error('Author error:', authorErr.message)
  }
  const authorId = author?.id
  console.log(`Author: ${authorId ? 'Demo Content (id=' + authorId + ')' : 'already exists, fetching...'}`)

  // Fetch if already existed
  let finalAuthorId = authorId
  if (!finalAuthorId) {
    const { data: existing } = await supabase.from('authors').select('id').eq('name', 'Demo Content').single()
    finalAuthorId = existing?.id
  }
  if (!finalAuthorId) {
    console.error('Could not create or find demo author. Aborting.')
    process.exit(1)
  }
  console.log(`Using author id: ${finalAuthorId}\n`)

  // 2. Upsert categories and collect IDs
  const catMap = new Map<string, number>()
  for (const cat of categories) {
    const { data: existing } = await supabase.from('categories').select('id').eq('slug', cat.slug).maybeSingle()
    if (existing) {
      catMap.set(cat.slug, existing.id)
      console.log(`Category exists: ${cat.slug} (id=${existing.id})`)
    } else {
      const { data: inserted, error } = await supabase.from('categories').insert(cat).select('id').single()
      if (error) { console.error(`Category insert error: ${error.message}`); continue }
      if (inserted) {
        catMap.set(cat.slug, inserted.id)
        console.log(`Created category: ${cat.slug} (id=${inserted.id})`)
      }
    }
  }

  // 3. Insert demo articles
  const existingSlugs = new Set<string>()
  const { data: existingArticles } = await supabase.from('articles').select('slug')
  if (existingArticles) {
    for (const a of existingArticles) existingSlugs.add(a.slug)
  }

  let inserted = 0
  let skipped = 0

  for (const article of articles) {
    if (existingSlugs.has(article.slug)) {
      console.log(`Skipping existing: ${article.slug}`)
      skipped++
      continue
    }

    const catId = catMap.get(article.category_slug)
    if (!catId) {
      console.error(`No category ID for: ${article.category_slug}, skipping article: ${article.slug}`)
      continue
    }

    const { error } = await supabase.from('articles').insert({
      title_uz: article.title_uz,
      title_en: article.title_en,
      slug: article.slug,
      category_id: catId,
      excerpt_uz: article.excerpt_uz,
      excerpt_en: article.excerpt_en,
      cover_image_url: article.cover_image_url,
      author_id: finalAuthorId,
      published: true,
      published_date: new Date().toISOString(),
      original_language: 'uz',
      tags: ['demo'],
    })
    if (error) {
      console.error(`Insert error [${article.slug}]: ${error.message}`)
    } else {
      inserted++
      console.log(`Created: ${article.slug}`)
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`)
  console.log(`To delete all demo articles later: DELETE FROM articles WHERE author_id = ${finalAuthorId};`)
}

seed().catch(console.error)
