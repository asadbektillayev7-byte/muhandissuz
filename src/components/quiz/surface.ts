/**
 * The bg-card / border-border Tailwind utilities do not follow the theme on
 * this project — they resolve to the light values in both modes, which is why
 * the existing components (BottomNav, ArticleCard) set these inline instead.
 * Referencing the CSS variables directly keeps them live.
 */
export const surface = {
  backgroundColor: 'var(--card)',
  borderColor: 'var(--border)',
} as const

export const outline = {
  borderColor: 'var(--border)',
} as const
