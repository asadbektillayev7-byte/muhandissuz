export function field(item: any, name: string, locale: string) {
  const uz = item[`${name}_uz`]
  const en = item[`${name}_en`]
  if (locale === 'uz') return uz || en || ''
  return en || uz || ''
}

/** Rich text (jsonb) counterpart to `field()`: falls back to the other
 *  language when the requested one is missing or an empty document. */
export function localizedBody(item: any, name: string, locale: string) {
  const has = (b: any) => !!b && Array.isArray(b.content) && b.content.length > 0
  const uz = item?.[`${name}_uz`]
  const en = item?.[`${name}_en`]
  if (locale === 'uz') return has(uz) ? uz : has(en) ? en : null
  return has(en) ? en : has(uz) ? uz : null
}

export function l(s: string, locale: string): string {
  return locale === 'uz' ? `${s}_uz`.replace('_uz', '') + '_uz' : `${s}_en`
}
