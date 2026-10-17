'use client'

import { useEffect, useRef, useState } from 'react'

export type MurvachchaState = 'idle' | 'listening' | 'thinking' | 'dragging'

/** One transparent sprite sheet; pose changes never request another image. */
export function MurvachchaMascot({ state = 'idle' }: { state?: MurvachchaState }) {
  const [failed, setFailed] = useState(false)
  const [paused, setPaused] = useState(false)
  const source = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = source.current
    if (image?.complete && image.naturalWidth === 0) setFailed(true)
    const visibility = () => setPaused(document.hidden)
    visibility()
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [])

  return (
    <span className="murvachcha-mascot" data-state={state} data-paused={paused} aria-hidden="true">
      <span className="murvachcha-shadow" />
      {failed ? (
        <img className="murvachcha-fallback" src="/images/murvatcha.jpg" alt="" width={80} height={80} draggable={false} />
      ) : (
        <>
          {/* Also handles load failure, which a CSS background cannot report. */}
          <img ref={source} className="murvachcha-source" src="/images/murvachcha-sprites.webp" alt="" width={1536} height={1024} draggable={false} onError={() => setFailed(true)} />
          <span className="murvachcha-body"><span className="murvachcha-sprite" /></span>
        </>
      )}
    </span>
  )
}
