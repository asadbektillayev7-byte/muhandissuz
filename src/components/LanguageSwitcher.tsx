'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { FlagUS, FlagUZ } from './Flags'

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
