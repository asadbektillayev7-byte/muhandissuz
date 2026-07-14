// Placeholder data — replace with real partner logos/names once partnerships are confirmed.

import type { ReactNode } from 'react'
import { Building2, Handshake, Landmark, Globe, Shield, Truck, Warehouse, Factory, HeartHandshake, Briefcase } from 'lucide-react'

export interface PartnerItem {
  name: string
  icon: ReactNode
}

export const placeholderPartners: PartnerItem[] = [
  { name: 'Partner Organization', icon: <Building2 className="h-5 w-5" /> },
  { name: 'Future Partner', icon: <Handshake className="h-5 w-5" /> },
  { name: 'Industry Alliance', icon: <Landmark className="h-5 w-5" /> },
  { name: 'Global Network', icon: <Globe className="h-5 w-5" /> },
  { name: 'Tech Foundation', icon: <Shield className="h-5 w-5" /> },
  { name: 'Innovation Hub', icon: <Truck className="h-5 w-5" /> },
  { name: 'Research Lab', icon: <Warehouse className="h-5 w-5" /> },
  { name: 'Engineering Guild', icon: <Factory className="h-5 w-5" /> },
  { name: 'Startup Studio', icon: <HeartHandshake className="h-5 w-5" /> },
  { name: 'Venture Partner', icon: <Briefcase className="h-5 w-5" /> },
]
