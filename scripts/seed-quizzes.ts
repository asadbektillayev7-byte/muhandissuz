/**
 * Seeds three example quizzes built from existing Muhandiss articles.
 *
 *   npm run seed-quizzes
 *
 * Idempotent: quizzes are matched on slug, and a quiz's questions and article
 * links are replaced on each run.
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const db = createClient(url, key, { auth: { persistSession: false } })

type Q = {
  question_uz: string
  question_en: string
  options_uz: string[]
  options_en: string[]
  correct_index: number
  explanation_uz: string
  explanation_en: string
}

type Seed = {
  slug: string
  categorySlug: string
  title_uz: string
  title_en: string
  description_uz: string
  description_en: string
  difficulty: 'easy' | 'medium' | 'hard'
  duration_minutes: number
  articleSlugs: string[]
  questions: Q[]
}

const SEEDS: Seed[] = [
  {
    slug: 'tishli-gildiraklar-asoslari',
    categorySlug: 'mechanical-engineering',
    title_uz: 'Tishli gildiraklar va uzatmalar',
    title_en: 'Gears and Power Transmission',
    description_uz: 'Reduktorlar, uzatish nisbati va ichki yonuv dvigatellari haqidagi maqolalar asosida.',
    description_en: 'Built from the articles on gearboxes, gear ratios and internal combustion engines.',
    difficulty: 'easy',
    duration_minutes: 4,
    articleSlugs: ['gears-and-gearboxes', 'thermodynamics-ic-engines'],
    questions: [
      {
        question_uz: 'Reduktor asosan nima uchun ishlatiladi?',
        question_en: 'What is a gearbox primarily used for?',
        options_uz: ['Aylanish tezligi va momentini o‘zgartirish', 'Dvigatelni sovutish', 'Yoqilg‘ini filtrlash', 'Elektr energiya ishlab chiqarish'],
        options_en: ['Changing rotational speed and torque', 'Cooling the engine', 'Filtering fuel', 'Generating electricity'],
        correct_index: 0,
        explanation_uz: 'Reduktor kirish aylanish tezligini chiqishda o‘zgartiradi va shu bilan birga momentni teskari nisbatda oshiradi.',
        explanation_en: 'A gearbox trades rotational speed for torque: as speed drops, torque rises in inverse proportion.',
      },
      {
        question_uz: 'Ikkita tishli gildirak bir-biri bilan ilashganda ular qanday aylanadi?',
        question_en: 'When two gears mesh, how do they rotate?',
        options_uz: ['Qarama-qarshi yo‘nalishda', 'Bir xil yo‘nalishda', 'Tasodifiy yo‘nalishda', 'Umuman aylanmaydi'],
        options_en: ['In opposite directions', 'In the same direction', 'In random directions', 'They do not rotate'],
        correct_index: 0,
        explanation_uz: 'Tashqi ilashuvda tishlar bir-birini itaradi, shuning uchun gildiraklar qarama-qarshi yo‘nalishda aylanadi.',
        explanation_en: 'In an external mesh the teeth push against each other, so the two gears turn in opposite directions.',
      },
      {
        question_uz: '20 tishli gildirak 40 tishli gildirakni aylantirsa, uzatish nisbati qanday bo‘ladi?',
        question_en: 'A 20-tooth gear drives a 40-tooth gear. What is the gear ratio?',
        options_uz: ['1:2 — chiqish ikki barobar sekin', '2:1 — chiqish ikki barobar tez', '1:1 — tezlik o‘zgarmaydi', '1:4 — chiqish to‘rt barobar sekin'],
        options_en: ['1:2 — output turns half as fast', '2:1 — output turns twice as fast', '1:1 — speed is unchanged', '1:4 — output turns four times slower'],
        correct_index: 0,
        explanation_uz: 'Tezliklar nisbati tishlar soniga teskari proporsional: 20/40 = 1/2, ya’ni chiqish ikki barobar sekin aylanadi.',
        explanation_en: 'Angular speed is inversely proportional to tooth count: 20/40 = 1/2, so the output turns at half the speed.',
      },
    ],
  },
  {
    slug: 'elektronika-va-elektr-dvigatellar',
    categorySlug: 'electrical-engineering',
    title_uz: 'Elektronika va elektr dvigatellar',
    title_en: 'Electronics and Electric Motors',
    description_uz: 'PCB dizayni va elektr dvigatellar turlari haqidagi maqolalar asosida.',
    description_en: 'Built from the articles on PCB design and types of electric motors.',
    difficulty: 'medium',
    duration_minutes: 5,
    articleSlugs: ['pcb-design-basics', 'electric-motors-dc-stepper'],
    questions: [
      {
        question_uz: 'PCB qisqartmasi nimani anglatadi?',
        question_en: 'What does PCB stand for?',
        options_uz: ['Printed Circuit Board', 'Power Control Box', 'Primary Circuit Bus', 'Programmable Chip Board'],
        options_en: ['Printed Circuit Board', 'Power Control Box', 'Primary Circuit Bus', 'Programmable Chip Board'],
        correct_index: 0,
        explanation_uz: 'PCB — bu Printed Circuit Board, ya’ni komponentlarni ulovchi o‘tkazgich yo‘llari bosilgan plata.',
        explanation_en: 'PCB stands for Printed Circuit Board — the laminated board whose printed traces connect the components.',
      },
      {
        question_uz: 'Stepper dvigatelning asosiy afzalligi nimada?',
        question_en: 'What is the main advantage of a stepper motor?',
        options_uz: ['Aniq burchakli pozitsiyalash', 'Eng yuqori quvvat zichligi', 'Umuman shovqin chiqarmasligi', 'Elektr energiya talab qilmasligi'],
        options_en: ['Precise angular positioning', 'The highest power density', 'Completely silent operation', 'Requiring no electrical power'],
        correct_index: 0,
        explanation_uz: 'Stepper dvigatel harakatni diskret qadamlarga bo‘ladi, shuning uchun teskari aloqasiz ham aniq pozitsiyalash mumkin.',
        explanation_en: 'A stepper moves in discrete steps, so it can hold a precise angular position without feedback.',
      },
      {
        question_uz: 'PCB da yer (ground) qatlami nima uchun kerak?',
        question_en: 'Why does a PCB use a ground plane?',
        options_uz: ['Shovqinni kamaytirish va qaytish yo‘lini ta’minlash', 'Platani og‘irroq qilish', 'Rangini o‘zgartirish', 'Faqat chiroyli ko‘rinish uchun'],
        options_en: ['To reduce noise and provide a return path', 'To make the board heavier', 'To change its colour', 'Purely for appearance'],
        correct_index: 0,
        explanation_uz: 'Yer qatlami signallar uchun past impedansli qaytish yo‘lini beradi va elektromagnit shovqinni sezilarli kamaytiradi.',
        explanation_en: 'A ground plane gives signals a low-impedance return path and significantly reduces electromagnetic noise.',
      },
    ],
  },
  {
    slug: 'suniy-intellekt-asoslari',
    categorySlug: 'ai',
    title_uz: 'Sun’iy intellekt asoslari',
    title_en: 'Foundations of Artificial Intelligence',
    description_uz: 'Neyron tarmoqlar va katta til modellari haqidagi maqolalar asosida.',
    description_en: 'Built from the articles on neural networks and large language models.',
    difficulty: 'medium',
    duration_minutes: 5,
    articleSlugs: ['neural-networks-image-recognition', 'large-language-models-gpt'],
    questions: [
      {
        question_uz: 'Neyron tarmoqda "qatlam" (layer) nima?',
        question_en: 'What is a "layer" in a neural network?',
        options_uz: ['Birgalikda ishlov beruvchi neyronlar to‘plami', 'Ma’lumotlar bazasi jadvali', 'Dasturlash tili', 'Xotira turi'],
        options_en: ['A group of neurons that process data together', 'A database table', 'A programming language', 'A type of memory'],
        correct_index: 0,
        explanation_uz: 'Qatlam — bu kirishni birgalikda qayta ishlab, natijani keyingi qatlamga uzatuvchi neyronlar guruhi.',
        explanation_en: 'A layer is a group of neurons that transform their input together and pass the result to the next layer.',
      },
      {
        question_uz: 'Katta til modellari asosan nimani bashorat qiladi?',
        question_en: 'What do large language models fundamentally predict?',
        options_uz: ['Keyingi tokenni', 'Ob-havoni', 'Tasvir o‘lchamini', 'Protsessor haroratini'],
        options_en: ['The next token', 'The weather', 'Image dimensions', 'Processor temperature'],
        correct_index: 0,
        explanation_uz: 'Til modeli oldingi kontekstga asoslanib keyingi tokenning ehtimolligini hisoblaydi va shu asosda matn hosil qiladi.',
        explanation_en: 'A language model estimates the probability of the next token given the preceding context, generating text step by step.',
      },
      {
        question_uz: 'Tasvirni aniqlashda ko‘proq qanday tarmoq turi ishlatiladi?',
        question_en: 'Which network type is most used for image recognition?',
        options_uz: ['Konvolyutsion neyron tarmoq (CNN)', 'Relyatsion ma’lumotlar bazasi', 'Blokcheyn', 'Kompilyator'],
        options_en: ['Convolutional neural network (CNN)', 'A relational database', 'A blockchain', 'A compiler'],
        correct_index: 0,
        explanation_uz: 'CNN filtrlar yordamida tasvirdagi mahalliy belgilarni aniqlaydi, shuning uchun tasvirni tanib olishda samarali.',
        explanation_en: 'CNNs use filters to detect local features in an image, which makes them effective at recognition tasks.',
      },
    ],
  },
]

async function main() {
  const { data: cats } = await db.from('categories').select('id, slug')
  const { data: arts } = await db.from('articles').select('id, slug')
  const catId = new Map((cats ?? []).map((c: any) => [c.slug, c.id]))
  const artId = new Map((arts ?? []).map((a: any) => [a.slug, a.id]))

  for (const s of SEEDS) {
    const category_id = catId.get(s.categorySlug) ?? null
    if (!category_id) console.warn(`  ! category "${s.categorySlug}" not found — leaving null`)

    const { data: quiz, error } = await db
      .from('quizzes')
      .upsert(
        {
          slug: s.slug,
          category_id,
          title_uz: s.title_uz,
          title_en: s.title_en,
          description_uz: s.description_uz,
          description_en: s.description_en,
          difficulty: s.difficulty,
          duration_minutes: s.duration_minutes,
          published: true,
        },
        { onConflict: 'slug' }
      )
      .select()
      .single()

    if (error || !quiz) {
      console.error(`  x ${s.slug}: ${error?.message}`)
      continue
    }

    await db.from('quiz_questions').delete().eq('quiz_id', quiz.id)
    const rows = s.questions.map((q, i) => ({ ...q, quiz_id: quiz.id, sort_order: i }))
    const { error: qErr } = await db.from('quiz_questions').insert(rows)
    if (qErr) console.error(`  x questions for ${s.slug}: ${qErr.message}`)

    await db.from('quiz_articles').delete().eq('quiz_id', quiz.id)
    const links = s.articleSlugs
      .map((slug) => artId.get(slug))
      .filter(Boolean)
      .map((article_id) => ({ quiz_id: quiz.id, article_id }))
    if (links.length) {
      const { error: lErr } = await db.from('quiz_articles').insert(links)
      if (lErr) console.error(`  x links for ${s.slug}: ${lErr.message}`)
    }

    console.log(`  ok ${s.slug} — ${rows.length} questions, ${links.length} articles`)
  }
}

main().then(() => console.log('done'))
