'use client'

import { placeholderPartners, type PartnerItem } from '@/lib/partners-data'

function PartnerBadge({ name, url, logo_url }: PartnerItem) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card transition-colors duration-150 hover:border-accent hover:bg-muted"
    >
      <div className="h-10 w-10 shrink-0 rounded-md bg-secondary flex items-center justify-center text-muted-foreground text-xs font-mono overflow-hidden">
        {logo_url ? (
          <img src={logo_url} alt={name} className="h-full w-full object-contain" />
        ) : (
          name.charAt(0)
        )}
      </div>
      <span className="text-sm font-semibold tracking-wide uppercase text-foreground/80 whitespace-nowrap">
        {name}
      </span>
    </a>
  )
}

export function PartnerMarquee({ partners }: { partners?: PartnerItem[] }) {
  // Fall back to the built-in list so the strip is never empty.
  const items = partners?.length ? partners : placeholderPartners

  // Static row — each partner appears exactly once, nothing scrolls.
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((partner, i) => (
        <PartnerBadge
          key={`partner-${i}`}
          name={partner.name}
          url={partner.url}
          logo_url={partner.logo_url}
        />
      ))}
    </div>
  )
}
