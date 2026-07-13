'use client'

import { useCallback } from 'react'
import { Settings, Bot, Building2, Zap, FlaskConical, Rocket, Car, Battery, Wrench, Heart } from 'lucide-react'
import type { Category } from '../../../../payload-types'
import { MorphingCardStack, type CardData } from '@/components/ui/morphing-card-stack'

const iconMap: Record<string, React.ReactNode> = {
  'mechanical-engineering': <Settings className="h-5 w-5" />,
  'robotics-mechatronics': <Bot className="h-5 w-5" />,
  'civil-structural': <Building2 className="h-5 w-5" />,
  'electrical-electronics': <Zap className="h-5 w-5" />,
  'materials-science': <FlaskConical className="h-5 w-5" />,
  'aerospace-engineering': <Rocket className="h-5 w-5" />,
  'automotive-engineering': <Car className="h-5 w-5" />,
  'energy-systems': <Battery className="h-5 w-5" />,
  'manufacturing-cadcam': <Wrench className="h-5 w-5" />,
  'biomedical-engineering': <Heart className="h-5 w-5" />,
}

const descriptions: Record<string, { uz: string; en: string }> = {
  'mechanical-engineering': { uz: 'Mashinasozlik bo\'yicha bilimingizni sinab ko\'ring', en: 'Test your knowledge of Mechanical Engineering' },
  'robotics-mechatronics': { uz: 'Robototexnika va mexatronika bo\'yicha test', en: 'Test your knowledge of Robotics & Mechatronics' },
  'civil-structural': { uz: 'Qurilish va konstruksiya bo\'yicha test', en: 'Test your knowledge of Civil & Structural Engineering' },
  'electrical-electronics': { uz: 'Elektr va elektronika bo\'yicha test', en: 'Test your knowledge of Electrical & Electronics' },
  'materials-science': { uz: 'Materialshunoslik bo\'yicha test', en: 'Test your knowledge of Materials Science' },
  'aerospace-engineering': { uz: 'Aerokosmik muhandislik bo\'yicha test', en: 'Test your knowledge of Aerospace Engineering' },
  'automotive-engineering': { uz: 'Avtomobilsozlik bo\'yicha test', en: 'Test your knowledge of Automotive Engineering' },
  'energy-systems': { uz: 'Energiya tizimlari bo\'yicha test', en: 'Test your knowledge of Energy Systems' },
  'manufacturing-cadcam': { uz: 'Ishlab chiqarish va CAD/CAM bo\'yicha test', en: 'Test your knowledge of Manufacturing & CAD/CAM' },
  'biomedical-engineering': { uz: 'Biomedikal muhandislik bo\'yicha test', en: 'Test your knowledge of Biomedical Engineering' },
}

export function QuizCardStack({ categories, locale }: { categories: Category[]; locale: string }) {
  const handleCardClick = useCallback((card: CardData) => {
    // TODO: Navigate to quiz questions for the selected category
    console.log('Selected category:', card.id)
  }, [])

  const cards: CardData[] = categories.map((cat) => ({
    id: cat.slug,
    title: typeof cat.name === 'string' ? cat.name : '',
    description: descriptions[cat.slug]?.[locale as 'uz' | 'en'] || '',
    icon: iconMap[cat.slug] || null,
  }))

  return (
    <MorphingCardStack
      cards={cards}
      defaultLayout="stack"
      onCardClick={handleCardClick}
    />
  )
}
