import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-7 w-auto shrink-0", className)}
    >
      <g className="text-muted-foreground" stroke="currentColor">
        <circle cx="30" cy="30" r="18" strokeWidth="2.5" />
        <circle cx="30" cy="30" r="8" strokeWidth="2" />
        <line x1="30" y1="8" x2="30" y2="16" strokeWidth="2.5" />
        <line x1="30" y1="44" x2="30" y2="52" strokeWidth="2.5" />
        <line x1="8" y1="30" x2="16" y2="30" strokeWidth="2.5" />
        <line x1="44" y1="30" x2="52" y2="30" strokeWidth="2.5" />
        <line x1="14.5" y1="14.5" x2="20" y2="20" strokeWidth="2" />
        <line x1="40" y1="40" x2="45.5" y2="45.5" strokeWidth="2" />
        <line x1="45.5" y1="14.5" x2="40" y2="20" strokeWidth="2" />
        <line x1="20" y1="40" x2="14.5" y2="45.5" strokeWidth="2" />
      </g>
      <text
        x="56" y="38"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="currentColor"
        className="text-foreground"
      >
        Muhandis
      </text>
      <text
        x="160" y="38"
        fontFamily="'Fira Code', monospace"
        fontSize="14"
        fill="currentColor"
        className="text-muted-foreground"
      >
        .uz
      </text>
    </svg>
  )
}
