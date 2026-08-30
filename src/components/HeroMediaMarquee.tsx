import Image from 'next/image'
import { createPublicClient } from '@/lib/supabase/public'

/**
 * Decorative hero backdrop: a single track of portrait cards sliding right to
 * left forever. No interaction of any kind — not a slider, no lightbox.
 *
 * The loop is pure CSS: the list is repeated so the track is exactly two
 * identical halves, and the keyframe translates it by -50%, which lands on a
 * pixel-identical frame. React never re-renders for the animation.
 */

const CARD_W = 180
const CARD_H = 240 // 3:4 portrait
const GAP = 12
/** Constant travel speed. Duration is derived from track width, never fixed. */
const PX_PER_SECOND = 45
/** Cards per pass needed to overflow the container before repeating. */
const MIN_PER_PASS = 6

export async function HeroMediaMarquee({ locale }: { locale: string }) {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('media')
    .select('id, url, alt_uz, alt_en')
    .like('mime_type', 'image/%')
    .order('created_at', { ascending: false })
    .limit(24)

  const images = data ?? []
  if (images.length === 0) return null

  // With few images, repeat the list until one pass overflows the container;
  // with many, one pass is already wide enough. Either way the track is that
  // unit rendered exactly twice, so -50% is a seamless wrap.
  const passes = Math.max(1, Math.ceil(MIN_PER_PASS / images.length))
  const unit = Array.from({ length: passes }, () => images).flat()
  const unitWidth = unit.length * (CARD_W + GAP)
  const durationSeconds = unitWidth / PX_PER_SECOND

  const track = [...unit, ...unit]

  return (
    <div className="relative h-[300px] md:h-[470px]" aria-hidden="true">
      {/* Wider than its column and anchored right, so it bleeds left behind
          the headline. The mask dissolves it well before the text. */}
      <div
        className="absolute inset-y-0 right-0 w-[170%] overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, transparent 30%, #000 58%, #000 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, transparent 30%, #000 58%, #000 100%)',
        }}
      >
        <div
          className="hero-marquee-track flex h-full items-center"
          style={{
            gap: `${GAP}px`,
            width: `${unitWidth * 2}px`,
            animationDuration: `${durationSeconds}s`,
          }}
        >
          {track.map((m: any, i) => (
            <div
              key={`${m.id}-${i}`}
              className="shrink-0 overflow-hidden bg-secondary"
              style={{ width: CARD_W, height: CARD_H, borderRadius: 'var(--radius)' }}
            >
              <Image
                src={m.url}
                alt=""
                width={CARD_W}
                height={CARD_H}
                className="h-full w-full object-cover"
                // Only the first screenful is worth prioritising.
                priority={i < 3}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
