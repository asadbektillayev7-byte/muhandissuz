'use client'

import { Marquee } from '@/components/ui/marquee'
import { placeholderPartners } from '@/lib/partners-data'

const bottomRowOrder = [3, 7, 1, 5, 9, 2, 6, 0, 4, 8]

function PartnerBadge({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mx-3 px-4 py-3 rounded-lg border border-border bg-card">
      <div className="h-10 w-10 shrink-0 rounded-md bg-secondary flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <span className="text-sm font-semibold tracking-wide uppercase text-foreground/80 whitespace-nowrap">
        {name}
      </span>
    </div>
  )
}

export function PartnerMarquee() {
  return (
    <div className="space-y-6">
      <Marquee direction="right" duration={40} pauseOnHover>
        {placeholderPartners.map((partner, i) => (
          <PartnerBadge key={`top-${i}`} name={partner.name} icon={partner.icon} />
        ))}
      </Marquee>

      <Marquee direction="left" duration={45} pauseOnHover>
        {bottomRowOrder.map((idx, i) => (
          <PartnerBadge key={`bottom-${i}`} name={placeholderPartners[idx].name} icon={placeholderPartners[idx].icon} />
        ))}
      </Marquee>
    </div>
  )
}
