export function resolveLocalizedField(
  field: unknown,
  locale: string,
): string {
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      if (parsed && typeof parsed === 'object' && (typeof parsed.uz === 'string' || typeof parsed.en === 'string')) {
        return parsed[locale] || parsed.en || parsed.uz || field
      }
    } catch {
      // not JSON, use as-is
    }
    return field
  }
  if (field && typeof field === 'object') {
    const obj = field as Record<string, unknown>
    if (typeof obj.uz === 'string' || typeof obj.en === 'string') {
      return (obj[locale] as string) || (obj.en as string) || (obj.uz as string) || ''
    }
  }
  return ''
}
