import type { ReactNode } from 'react'
import { Settings, Bot, Building2, Zap, FlaskConical, Rocket, Car, Battery, Wrench, Heart } from 'lucide-react'

export interface CategoryMeta {
  icon: ReactNode
  description: { uz: string; en: string }
}

export const categoryMetaMap: Record<string, CategoryMeta> = {
  'mechanical-engineering': {
    icon: <Settings className="h-5 w-5" />,
    description: {
      uz: 'Mashinasozlik bo\'yicha bilimingizni sinab ko\'ring',
      en: 'Test your knowledge of Mechanical Engineering',
    },
  },
  'robotics-mechatronics': {
    icon: <Bot className="h-5 w-5" />,
    description: {
      uz: 'Robototexnika va mexatronika bo\'yicha test',
      en: 'Test your knowledge of Robotics & Mechatronics',
    },
  },
  'civil-structural': {
    icon: <Building2 className="h-5 w-5" />,
    description: {
      uz: 'Qurilish va konstruksiya bo\'yicha test',
      en: 'Test your knowledge of Civil & Structural Engineering',
    },
  },
  'electrical-electronics': {
    icon: <Zap className="h-5 w-5" />,
    description: {
      uz: 'Elektr va elektronika bo\'yicha test',
      en: 'Test your knowledge of Electrical & Electronics',
    },
  },
  'materials-science': {
    icon: <FlaskConical className="h-5 w-5" />,
    description: {
      uz: 'Materialshunoslik bo\'yicha test',
      en: 'Test your knowledge of Materials Science',
    },
  },
  'aerospace-engineering': {
    icon: <Rocket className="h-5 w-5" />,
    description: {
      uz: 'Aerokosmik muhandislik bo\'yicha test',
      en: 'Test your knowledge of Aerospace Engineering',
    },
  },
  'automotive-engineering': {
    icon: <Car className="h-5 w-5" />,
    description: {
      uz: 'Avtomobilsozlik bo\'yicha test',
      en: 'Test your knowledge of Automotive Engineering',
    },
  },
  'energy-systems': {
    icon: <Battery className="h-5 w-5" />,
    description: {
      uz: 'Energiya tizimlari bo\'yicha test',
      en: 'Test your knowledge of Energy Systems',
    },
  },
  'manufacturing-cadcam': {
    icon: <Wrench className="h-5 w-5" />,
    description: {
      uz: 'Ishlab chiqarish va CAD/CAM bo\'yicha test',
      en: 'Test your knowledge of Manufacturing & CAD/CAM',
    },
  },
  'biomedical-engineering': {
    icon: <Heart className="h-5 w-5" />,
    description: {
      uz: 'Biomedikal muhandislik bo\'yicha test',
      en: 'Test your knowledge of Biomedical Engineering',
    },
  },
}
