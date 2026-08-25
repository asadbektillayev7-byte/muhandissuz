'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'

/**
 * Inline SVG rather than emoji: flag emoji do not render on Windows, where
 * they fall back to the letters "UZ" / "US" — the exact thing we're replacing.
 */
function FlagUZ({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" fill="#0099B5" />
      <rect y="5.4" width="24" height="5.2" fill="#fff" />
      <rect y="10.6" width="24" height="5.4" fill="#1EB53A" />
      <rect y="5.1" width="24" height="0.5" fill="#CE1126" />
      <rect y="10.4" width="24" height="0.5" fill="#CE1126" />
      <circle cx="4.6" cy="2.7" r="1.8" fill="#fff" />
      <circle cx="5.4" cy="2.7" r="1.8" fill="#0099B5" />
      <g fill="#fff">
        <circle cx="8.2" cy="1.4" r="0.42" />
        <circle cx="8.2" cy="3.1" r="0.42" />
        <circle cx="10" cy="1.4" r="0.42" />
        <circle cx="10" cy="3.1" r="0.42" />
        <circle cx="10" cy="4.6" r="0.42" />
        <circle cx="11.8" cy="1.4" r="0.42" />
        <circle cx="11.8" cy="3.1" r="0.42" />
        <circle cx="11.8" cy="4.6" r="0.42" />
      </g>
    </svg>
  )
}

function FlagUS({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" fill="#fff" />
      <g fill="#B22234">
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect key={i} y={(i * 16) / 13} width="24" height={16 / 13} />
        ))}
      </g>
      <rect width="10" height={(7 * 16) / 13} fill="#3C3B6E" />
      <g fill="#fff">
        {[1.4, 4.2, 7].map((y) =>
          [1.4, 3.6, 5.8, 8].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.5" />)
        )}
        {[2.8, 5.6].map((y) =>
          [2.5, 4.7, 6.9].map((x) => <circle key={`${x}-${y}b`} cx={x} cy={y} r="0.5" />)
        )}
      </g>
    </svg>
  )
}

const LOCALES = [
  { code: 'uz', label: "O'zbekcha", Flag: FlagUZ },
  { code: 'en', label: 'English', Flag: FlagUS },
] as const

export function LanguageSwitcher() {
  const pathname = usePathname()
  const params = useParams()
  const current = (params.locale as string) || 'uz'
  const rest = pathname.replace(/^\/(uz|en)/, '') || '/'

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Language">
      {LOCALES.map(({ code, label, Flag }) => {
        const active = current === code
        return (
          <Link
            key={code}
            href={`/${code}${rest}`}
            aria-label={label}
            aria-current={active ? 'true' : undefined}
            title={label}
            className={
              'block overflow-hidden rounded-[3px] border transition-all duration-150 ' +
              (active
                ? 'border-foreground/50 opacity-100'
                : 'border-transparent opacity-45 hover:opacity-90')
            }
          >
            <Flag className="h-[14px] w-[21px] block" />
          </Link>
        )
      })}
    </div>
  )
}
