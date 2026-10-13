const uzMonths = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const tashkentOffset = 5 * 60 * 60 * 1000

function parseTimestamp(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return NaN
  // Supabase supplies offsets; legacy timestamps without one mean UTC.
  const iso = value.includes('T') && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? `${value}Z` : value
  return Date.parse(iso)
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const time = Date.parse(value)
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value
}

/** Format stored timestamps for a date input using the user's Tashkent day. */
export function dateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const input = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return isCalendarDate(input) ? input : ''
  const time = parseTimestamp(input)
  if (Number.isNaN(time)) return ''
  return new Date(time + tashkentOffset).toISOString().slice(0, 10)
}

/** Persist the chosen calendar day at Tashkent midnight, regardless of host TZ. */
export function dateInputToISOString(value: string): string | null {
  if (!isCalendarDate(value)) return null
  return new Date(`${value}T00:00:00+05:00`).toISOString()
}

/** Fixed Tashkent calendar dates, independent of browser ICU and host timezone. */
export function formatShowcaseDate(value: string | null | undefined, locale: string): string {
  if (!value) return ''
  const input = value.trim()
  const time = parseTimestamp(input)
  if (Number.isNaN(time)) return ''
  const date = new Date(time + tashkentOffset)
  const months = locale === 'uz' ? uzMonths : enMonths
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}
