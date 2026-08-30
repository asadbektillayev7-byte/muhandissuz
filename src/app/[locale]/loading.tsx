/**
 * Shown the instant a navigation starts, so a click paints something rather
 * than freezing on the previous page while the server renders. Applies to
 * every route under [locale] that has no closer loading.tsx of its own.
 */
export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Yuklanmoqda…</span>

      <div className="h-10 w-2/5 rounded bg-secondary animate-pulse" />
      <div className="mt-3 h-4 w-3/5 rounded bg-secondary animate-pulse" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border">
            <div className="aspect-[4/3] bg-secondary animate-pulse" />
            <div className="p-4">
              <div className="h-3 w-1/3 rounded bg-secondary animate-pulse" />
              <div className="mt-3 h-4 w-5/6 rounded bg-secondary animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
