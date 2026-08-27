'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'

/**
 * Inline SVG rather than emoji: flag emoji do not render on Windows, where
 * they fall back to the letters "UZ" / "US" — the thing we're replacing.
 * A native <select> can't draw them, so this is a small custom listbox.
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
        <circle cx="8.2" cy="1.4" r="0.42" /><circle cx="8.2" cy="3.1" r="0.42" />
        <circle cx="10" cy="1.4" r="0.42" /><circle cx="10" cy="3.1" r="0.42" />
        <circle cx="10" cy="4.6" r="0.42" /><circle cx="11.8" cy="1.4" r="0.42" />
        <circle cx="11.8" cy="3.1" r="0.42" /><circle cx="11.8" cy="4.6" r="0.42" />
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
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = (params.locale as string) || 'uz'
  const rest = pathname.replace(/^\/(uz|en)/, '') || '/'
  const active = LOCALES.find((l) => l.code === current) ?? LOCALES[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function choose(code: string) {
    setOpen(false)
    if (code !== current) router.push(`/${code}${rest}`)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${active.label}`}
        className="flex items-center gap-1.5 border px-2 py-1 transition-colors duration-150 hover:border-foreground/40"
        style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
      >
        <active.Flag className="h-[13px] w-[19px] block rounded-[2px]" />
        <span aria-hidden="true" className="text-[10px] text-muted-foreground">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 z-50 mt-1 min-w-[150px] overflow-hidden border py-1 shadow-lg"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
          }}
        >
          {LOCALES.map(({ code, label, Flag }) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === current}
                onClick={() => choose(code)}
                className={
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-secondary ' +
                  (code === current ? 'text-foreground' : 'text-muted-foreground')
                }
              >
                <Flag className="h-[13px] w-[19px] block shrink-0 rounded-[2px]" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
