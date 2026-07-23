'use client'

import { useParams } from 'next/navigation'
import { Star } from 'lucide-react'
import { Marquee } from '@/components/ui/marquee'
import { LiquidCard, CardContent } from '@/components/ui/liquid-glass-card'

/* Placeholder testimonials — replace with real community feedback once collected. */
const testimonials = [
  {
    initials: 'AA',
    name: 'Aziz A.',
    roleUz: 'Hakaton ishtirokchisi',
    roleEn: 'Hackathon Participant',
    quoteUz: 'Muhandiss.uz dagi hakatonlar amaliy ko\'nikmalarni rivojlantirishga katta yordam beradi.',
    quoteEn: 'The hackathons on Muhandiss.uz really help develop practical skills.',
    stars: 5,
  },
  {
    initials: 'MB',
    name: 'Madina B.',
    roleUz: 'Masterclass tashkilotchisi',
    roleEn: 'Workshop Mentor',
    quoteUz: 'Yosh muhandislar bilan bilim almashish juda ilhomlantiradi.',
    quoteEn: 'Sharing knowledge with young engineers is truly inspiring.',
    stars: 5,
  },
  {
    initials: 'JS',
    name: 'Jamshid S.',
    roleUz: 'Talaba, Robototexnika yo\'nalishi',
    roleEn: 'Student, Robotics Track',
    quoteUz: 'Loyihalar portali orqali birinchi jamoa loyihamni topdim.',
    quoteEn: 'I found my first team project through the projects portal.',
    stars: 4,
  },
  {
    initials: 'NO',
    name: 'Nilufar O.',
    roleUz: 'Muhandiss.uz tashkilotchisi',
    roleEn: 'Muhandiss.uz Organizer',
    quoteUz: 'Hamjamiyatning o\'sishini ko\'rish eng katta mukofot.',
    quoteEn: 'Watching the community grow is the greatest reward.',
    stars: 5,
  },
  {
    initials: 'SR',
    name: 'Sardor R.',
    roleUz: 'Maqola muallifi',
    roleEn: 'Article Author',
    quoteUz: 'Maqolalarimni nashr qilish va fikr-mulohaza olish juda foydali.',
    quoteEn: 'Publishing my articles and getting feedback has been invaluable.',
    stars: 4,
  },
  {
    initials: 'DK',
    name: 'Dilnoza K.',
    roleUz: 'Mentorlik dasturi ishtirokchisi',
    roleEn: 'Mentorship Program Participant',
    quoteUz: 'Mentorim bilan haftalik uchrashuvlarim katta yutuq bo\'ldi.',
    quoteEn: 'My weekly mentor sessions have been a game-changer.',
    stars: 5,
  },
  {
    initials: 'BT',
    name: 'Behruz T.',
    roleUz: 'Viktorina ishtirokchisi',
    roleEn: 'Quiz Participant',
    quoteUz: 'Quizlar bilimni mustahkamlashning qiziqarli usuli.',
    quoteEn: 'The quizzes are a fun way to reinforce knowledge.',
    stars: 4,
  },
  {
    initials: 'ZA',
    name: 'Zarnigor A.',
    roleUz: 'Talaba, Dasturlash yo\'nalishi',
    roleEn: 'Student, Programming Track',
    quoteUz: 'Resurslar va maqolalar juda foydali, ayniqsa boshlang\'ichlar uchun.',
    quoteEn: 'The resources and articles are super helpful, especially for beginners.',
    stars: 5,
  },
]

function TestimonialCard({ t, locale }: { t: typeof testimonials[number]; locale: string }) {
  return (
    <LiquidCard className="w-72 mx-3 select-none">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground text-sm font-semibold shrink-0">
            {t.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{t.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {locale === 'uz' ? t.roleUz : t.roleEn}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          &ldquo;{locale === 'uz' ? t.quoteUz : t.quoteEn}&rdquo;
        </p>
        <div className="flex gap-0.5 text-chart-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5"
              fill={i < t.stars ? 'currentColor' : 'none'}
              strokeWidth={i < t.stars ? 1.5 : 2}
            />
          ))}
        </div>
      </CardContent>
    </LiquidCard>
  )
}

export function TestimonialMarquee() {
  const params = useParams()
  const locale = (params.locale as string) || 'uz'

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold mb-6">
        {locale === 'uz' ? 'Hamjamiyat fikrlari' : 'What our community says'}
      </h2>
      <Marquee direction="left" duration={60} pauseOnHover fade={true} fadeAmount={5}>
        {testimonials.map((t, i) => (
          <TestimonialCard key={`t-${i}`} t={t} locale={locale} />
        ))}
      </Marquee>
    </section>
  )
}
