'use client'

import { useState } from 'react'

/**
 * TEMPORARY comparison page for chat-avatar animation options.
 *
 * Deliberately self-contained: all CSS is scoped to this page under .ap- and
 * injected here rather than added to globals.css, and nothing imports from
 * ChatWidget. Deleting this folder removes the whole experiment, and until one
 * option is chosen the live chatbot is untouched.
 */

const AVATAR = '/images/murvatcha.jpg'

type State = 'idle' | 'thinking' | 'talking'

const CSS = `
/* Shared -------------------------------------------------------------- */
.ap-av { position: relative; display: inline-grid; place-items: center; }
.ap-av img {
  display: block;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}

/* Option A: idle loop -------------------------------------------------- */

/* Breathing and tilt on the image itself. Scale and rotate together read as
   one gesture rather than two competing ones. */
@keyframes ap-breathe {
  0%, 100% { transform: scale(1) rotate(-1.2deg); }
  50%      { transform: scale(1.045) rotate(1.2deg); }
}

/* The glow lives on a ring behind the image, not on the image's own
   box-shadow: animating a shadow on the moving element makes the blur
   shimmer with the scale. Cycles through the board's colours. */
@keyframes ap-glow {
  0%   { box-shadow: 0 0 10px 2px rgba(59,130,246,0.55); }
  33%  { box-shadow: 0 0 16px 5px rgba(34,211,238,0.55); }
  66%  { box-shadow: 0 0 13px 3px rgba(74,222,128,0.45); }
  100% { box-shadow: 0 0 10px 2px rgba(59,130,246,0.55); }
}

.ap-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  z-index: 1;
}

.ap-idle img   { animation: ap-breathe 3s ease-in-out infinite; }
/* A different period from the breathing, so the two never lock into a
   single obvious beat. */
.ap-idle .ap-ring { animation: ap-glow 4.5s ease-in-out infinite; }

/* Option B: thinking --------------------------------------------------- */

@keyframes ap-spin { to { transform: rotate(360deg); } }

/* A conic sweep masked to a thin band, so it reads as one bright arc
   travelling around the avatar. */
.ap-thinking .ap-sweep {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  z-index: 1;
  background: conic-gradient(from 0deg,
    rgba(59,130,246,0) 0deg,
    rgba(59,130,246,0) 200deg,
    rgba(34,211,238,0.95) 320deg,
    rgba(255,255,255,0.95) 355deg,
    rgba(59,130,246,0) 360deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px));
  animation: ap-spin 1.1s linear infinite;
}

.ap-thinking img { animation: ap-breathe 1.2s ease-in-out infinite; }
.ap-thinking .ap-ring { animation: ap-glow 1.4s ease-in-out infinite; }

/* Option B: talking ---------------------------------------------------- */

/* Rings expanding outward and fading, like something is being emitted. */
@keyframes ap-ripple {
  0%   { transform: scale(1);    opacity: 0.55; }
  100% { transform: scale(1.55); opacity: 0; }
}

.ap-talking .ap-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(34,211,238,0.8);
  z-index: 0;
  animation: ap-ripple 1.6s ease-out infinite;
}
/* Staggered so there is always a ring mid-flight. */
.ap-talking .ap-ripple:nth-child(2) { animation-delay: 0.53s; }
.ap-talking .ap-ripple:nth-child(3) { animation-delay: 1.06s; }

.ap-talking img { animation: ap-breathe 2s ease-in-out infinite; }
.ap-talking .ap-ring { animation: ap-glow 1.8s ease-in-out infinite; }

/* Soundwave bars, sitting under the avatar */
@keyframes ap-bar {
  0%, 100% { transform: scaleY(0.35); }
  50%      { transform: scaleY(1); }
}

.ap-bars { display: flex; align-items: center; gap: 3px; height: 18px; margin-top: 10px; }
.ap-bars i {
  display: block;
  width: 3px;
  height: 100%;
  border-radius: 2px;
  background: var(--accent);
  transform-origin: center;
  animation: ap-bar 0.7s ease-in-out infinite;
}
.ap-bars i:nth-child(1) { animation-delay: 0s;    }
.ap-bars i:nth-child(2) { animation-delay: 0.12s; }
.ap-bars i:nth-child(3) { animation-delay: 0.24s; }
.ap-bars i:nth-child(4) { animation-delay: 0.36s; }
.ap-bars i:nth-child(5) { animation-delay: 0.18s; }

/* Anyone who asked the OS to calm interfaces down gets a still avatar. */
@media (prefers-reduced-motion: reduce) {
  .ap-av img,
  .ap-ring,
  .ap-sweep,
  .ap-ripple,
  .ap-bars i {
    animation: none !important;
    transform: none !important;
  }
  .ap-ripple { opacity: 0 !important; }
}
`

function AvatarA({ size }: { size: number }) {
  return (
    <span className="ap-av ap-idle" style={{ width: size, height: size }}>
      <span className="ap-ring" />
      <img src={AVATAR} alt="" width={size} height={size} />
    </span>
  )
}

function AvatarB({ size, state }: { size: number; state: State }) {
  return (
    <span
      className={`ap-av ap-${state}`}
      style={{ width: size, height: size }}
    >
      {state === 'talking' && (
        <>
          <span className="ap-ripple" />
          <span className="ap-ripple" />
          <span className="ap-ripple" />
        </>
      )}
      {state === 'thinking' && <span className="ap-sweep" />}
      <span className="ap-ring" />
      <img src={AVATAR} alt="" width={size} height={size} />
    </span>
  )
}

export default function AvatarPreviewPage() {
  const [state, setState] = useState<State>('idle')

  const card: React.CSSProperties = {
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--card)',
    padding: '2rem',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 pt-12">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <h1 className="font-display mb-2 text-3xl font-bold">Avatar animation options</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Temporary page. The live chatbot is untouched — pick one and it gets wired in.
      </p>

      {/* Option A */}
      <section className="mb-12">
        <h2 className="mb-1 text-lg font-semibold">Option A — launcher bubble, idle loop</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Breathing scale on a 3s cycle, a slight tilt in the same gesture, and a glow ring
          cycling blue → cyan → green on a 4.5s cycle. The two periods differ on purpose so
          they never settle into one obvious beat.
        </p>
        <div style={card} className="flex flex-wrap items-end gap-10">
          <div className="text-center">
            <AvatarA size={56} />
            <p className="mt-3 text-xs text-muted-foreground">56px — real launcher size</p>
          </div>
          <div className="text-center">
            <AvatarA size={96} />
            <p className="mt-3 text-xs text-muted-foreground">96px — to judge the glow</p>
          </div>
          <div className="text-center">
            <AvatarA size={140} />
            <p className="mt-3 text-xs text-muted-foreground">140px</p>
          </div>
        </div>
      </section>

      {/* Option B */}
      <section className="mb-12">
        <h2 className="mb-1 text-lg font-semibold">Option B — state-aware, for the open panel</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Same idle loop as A, plus two states: <strong>thinking</strong> spins a bright arc
          around the avatar while waiting on the API, and <strong>talking</strong> emits
          ripples with soundwave bars while a reply arrives.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {(['idle', 'thinking', 'talking'] as State[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setState(s)}
              aria-pressed={state === s}
              className={
                'border px-4 py-2 text-sm capitalize transition-colors ' +
                (state === s
                  ? 'border-chart-2 text-chart-2'
                  : 'border-border text-muted-foreground hover:text-foreground')
              }
              style={{ borderRadius: 'var(--radius)' }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={card} className="flex flex-wrap items-start gap-12">
          <div className="text-center">
            <AvatarB size={120} state={state} />
            {state === 'talking' && (
              <span className="ap-bars justify-center">
                <i /><i /><i /><i /><i />
              </span>
            )}
            <p className="mt-3 text-xs text-muted-foreground">120px — current: {state}</p>
          </div>

          {/* All three at once, so they can be compared without clicking. */}
          {(['idle', 'thinking', 'talking'] as State[]).map((s) => (
            <div key={s} className="text-center">
              <AvatarB size={64} state={s} />
              {s === 'talking' && (
                <span className="ap-bars justify-center">
                  <i /><i /><i /><i /><i />
                </span>
              )}
              <p className="mt-3 text-xs capitalize text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Both options stop moving entirely when the operating system requests reduced motion.
      </p>
    </div>
  )
}
