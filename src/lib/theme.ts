/**
 * Time-of-day theme schedule.
 *
 * Dark from NIGHT_START until NIGHT_END the next morning; light in between.
 * Change these two numbers to shift the switchover.
 */
export const NIGHT_START_HOUR = 22 // 22:00 — dark from here
export const NIGHT_END_HOUR = 6 // 06:00 — light from here

export const THEME_KEY = 'theme'

/** What the clock says the theme should be right now, in the visitor's own time. */
export function scheduledTheme(now: Date = new Date()): 'dark' | 'light' {
  const h = now.getHours()
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR ? 'dark' : 'light'
}

/** A manual choice, or null when the visitor has never overridden the schedule. */
export function storedTheme(): 'dark' | 'light' | null {
  if (typeof window === 'undefined') return null
  const v = window.localStorage.getItem(THEME_KEY)
  return v === 'dark' || v === 'light' ? v : null
}

/** Manual choice wins; otherwise follow the clock. */
export function resolveTheme(): 'dark' | 'light' {
  return storedTheme() ?? scheduledTheme()
}
