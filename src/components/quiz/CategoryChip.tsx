'use client'
import { outline } from './surface'

/** Pill used both as a static category label and as a selectable filter. */
export function CategoryChip({
  label,
  selected = false,
  onClick,
  as = 'button',
}: {
  label: string
  selected?: boolean
  onClick?: () => void
  as?: 'button' | 'span'
}) {
  const classes = [
    'inline-flex items-center px-3 py-1.5 text-sm border transition-colors duration-150',
    selected
      ? 'bg-foreground text-background border-foreground font-medium'
      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40',
  ].join(' ')

  if (as === 'span') {
    return (
      <span
        className="inline-flex items-center border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
        style={{ borderRadius: 999, ...outline }}
      >
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={classes}
      style={{ borderRadius: 999, ...outline }}
    >
      {label}
    </button>
  )
}
