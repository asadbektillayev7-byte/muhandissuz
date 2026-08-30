'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { FlagUS, FlagUZ } from './Flags'

/**
 * Homepage-only language control: two overlapping flags, no dropdown. The
 * active language sits in front, at full opacity and ~22% larger. One click
 * anywhere on the pair switches to the other language.
 *
 * The flags keep fixed left/right positions — only size, opacity and stacking
 * change — so nothing jumps sideways when the language flips.
 */

const ACTIVE = { w: 26, h: 17 }
const IDLE = { w: 21, h: 14 }
/** How far the right flag tucks under the left one. */
const OVERLAP = 8

const LOCALES = [
  { code: 'uz', Flag: FlagUZ, switchTo: 'English' },
  { code: 'en', Flag: FlagUS, switchTo: "O'zbekcha" },
] as const

export function FlagLanguageToggle() {
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()

  const current = (params.locale as string) === 'en' ? 'en' : 'uz'
  const next = current === 'uz' ? 'en' : 'uz'
  const rest = pathname.replace(/^\/(uz|en)/, '') || '/'
  const target = LOCALES.find((l) => l.code === current)!

  return (
    <button
      type="button"
      onClick={() => router.push(`/${next}${rest}`)}
      aria-label={`Switch to ${target.switchTo}`}
      title={`Switch to ${target.switchTo}`}
      className="group relative flex items-center"
      style={{ height: ACTIVE.h }}
    >
      {LOCALES.map(({ code, Flag }, i) => {
        const isActive = code === current
        const size = isActive ? ACTIVE : IDLE

        return (
          <span
            key={code}
            className={
              'block overflow-hidden rounded-[2px] transition-all duration-200 ease-out ' +
              (isActive
                ? 'relative z-10 opacity-100'
                : 'opacity-55 group-hover:opacity-80')
            }
            style={{
              width: size.w,
              height: size.h,
              marginLeft: i === 0 ? 0 : -OVERLAP,
              // A hairline keeps the white stripes of either flag from
              // dissolving into a light background.
              boxShadow: '0 0 0 1px var(--border)',
            }}
          >
            <Flag className="block h-full w-full" />
          </span>
        )
      })}
    </button>
  )
}
