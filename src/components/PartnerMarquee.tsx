'use client'

import { Marquee } from '@/components/ui/marquee'
import { placeholderPartners } from '@/lib/partners-data'

function PartnerBadge({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 mx-3 px-4 py-3 rounded-lg border border-border bg-card hover:border-chart-2 transition-colors"
    >
      <div className="h-10 w-10 shrink-0 rounded-md bg-secondary flex items-center justify-center text-muted-foreground text-xs font-mono">
        {name.charAt(0)}
      </div>
      <span className="text-sm font-semibold tracking-wide uppercase text-foreground/80 whitespace-nowrap">
        {name}
      </span>
    </a>
  )
}

export function PartnerMarquee() {
  return (
    <Marquee direction="left" duration={40} pauseOnHover>
      {placeholderPartners.map((partner, i) => (
        <PartnerBadge key={`partner-${i}`} name={partner.name} url={partner.url} />
      ))}
    </Marquee>
  )
}
