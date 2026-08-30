/** Article pages are a single column, so the generic grid skeleton would
 *  flash the wrong shape before the real layout arrives. */
export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Yuklanmoqda…</span>
      <div className="aspect-video rounded-lg bg-secondary animate-pulse" />
      <div className="mt-8 h-9 w-4/5 rounded bg-secondary animate-pulse" />
      <div className="mt-4 h-4 w-2/5 rounded bg-secondary animate-pulse" />
      <div className="mt-8 space-y-3">
        {['w-full', 'w-full', 'w-11/12', 'w-full', 'w-4/5'].map((w, i) => (
          <div key={i} className={`h-4 rounded bg-secondary animate-pulse ${w}`} />
        ))}
      </div>
    </div>
  )
}
