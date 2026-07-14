import type { ReactNode } from 'react'
import { Cog, Zap, FlaskConical, Gauge, Building2, Leaf, Cpu } from 'lucide-react'

export interface CategoryMeta {
  icon: ReactNode
  description: { uz: string; en: string }
}

export const categoryMetaMap: Record<string, CategoryMeta> = {
  'mechanical-engineering': {
    icon: <Cog className="h-5 w-5" />,
    description: {
      uz: 'Mexanika bo\'yicha bilimingizni sinab ko\'ring',
      en: 'Test your knowledge of Mechanical Engineering',
    },
  },
  'electrical-engineering': {
    icon: <Zap className="h-5 w-5" />,
    description: {
      uz: 'Elektr muhandisligi bo\'yicha test',
      en: 'Test your knowledge of Electrical Engineering',
    },
  },
  'chemical-engineering': {
    icon: <FlaskConical className="h-5 w-5" />,
    description: {
      uz: 'Kimyo muhandisligi bo\'yicha test',
      en: 'Test your knowledge of Chemical Engineering',
    },
  },
  'motorsports-engineering': {
    icon: <Gauge className="h-5 w-5" />,
    description: {
      uz: 'Motosport muhandisligi bo\'yicha test',
      en: 'Test your knowledge of Motorsports Engineering',
    },
  },
  'civil-engineering': {
    icon: <Building2 className="h-5 w-5" />,
    description: {
      uz: 'Fuqarolik muhandisligi bo\'yicha test',
      en: 'Test your knowledge of Civil Engineering',
    },
  },
  'environmental-engineering': {
    icon: <Leaf className="h-5 w-5" />,
    description: {
      uz: 'Atrofmuhit muhandisligi bo\'yicha test',
      en: 'Test your knowledge of Environmental Engineering',
    },
  },
  'ai': {
    icon: <Cpu className="h-5 w-5" />,
    description: {
      uz: 'Suniy intellekt bo\'yicha test',
      en: 'Test your knowledge of AI',
    },
  },
}
