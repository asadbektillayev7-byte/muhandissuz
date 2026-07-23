export function field(item: any, name: string, locale: string) {
  const uz = item[`${name}_uz`]
  const en = item[`${name}_en`]
  if (locale === 'uz') return uz || en || ''
  return en || uz || ''
}

export function l(s: string, locale: string): string {
  return locale === 'uz' ? `${s}_uz`.replace('_uz', '') + '_uz' : `${s}_en`
}
