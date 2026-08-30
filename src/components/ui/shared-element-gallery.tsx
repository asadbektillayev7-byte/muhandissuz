'use client'

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { X, Play } from "lucide-react"

// --- Types ---
type MediaKind = "image" | "video"

interface MediaData {
  id: string
  src: string
  alt?: string
  kind: MediaKind
  /** Still frame for videos. Falls back to a titled tile when absent. */
  poster?: string
  title?: string
}

interface GalleryContextType {
  selected: MediaData | null
  setSelected: (item: MediaData | null) => void
}

const GalleryContext = React.createContext<GalleryContextType | null>(null)

// --- Physics ---
// `as const` so `type` narrows to the "spring" literal rather than string,
// which framer-motion's Transition type requires.
const spring = {
  type: "spring",
  stiffness: 350,
  damping: 35,
  mass: 1,
} as const

// --- Components ---

/**
 * Root Gallery Provider
 * Manages the state of the expanded item and renders the Modal.
 */
export function Gallery({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<MediaData | null>(null)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  React.useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "auto"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [selected])

  return (
    <GalleryContext.Provider value={{ selected, setSelected }}>
      {children}
      <GalleryModal />
    </GalleryContext.Provider>
  )
}

/**
 * Responsive Masonry Grid
 */
export function GalleryGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * A single gallery item. Images show themselves; videos show their poster
 * with a play badge, and the layoutId rides on that poster.
 *
 * The media element carries data-gallery-media so callers can size it
 * (the strip pins it to a fixed height) without guessing at the tag.
 */
export function GalleryImage({
  src,
  alt,
  id,
  className,
  kind = "image",
  poster,
  title,
}: {
  src: string
  alt?: string
  id: string
  className?: string
  kind?: MediaKind
  poster?: string
  title?: string
}) {
  const context = React.useContext(GalleryContext)
  if (!context) throw new Error("GalleryImage must be used within a Gallery")

  const isVideo = kind === "video"
  // A poster that 404s must fall back too, not just a missing one.
  const [stillFailed, setStillFailed] = React.useState(false)
  const [frameFailed, setFrameFailed] = React.useState(false)
  const stillRef = React.useRef<HTMLImageElement>(null)
  const stillSrc = isVideo ? poster : src
  const showStill = Boolean(stillSrc) && !stillFailed
  // No uploaded poster: let the browser paint the video's own first frame.
  // #t=0.1 seeks just past the start, because frame zero of a fade-in is
  // often solid black. Only metadata is fetched, so this costs a few KB.
  const showFrame = isVideo && !showStill && !frameFailed

  // onError alone is not enough: the server-rendered <img> can finish failing
  // before React hydrates, so the handler is never attached. Re-check on mount.
  React.useEffect(() => {
    const el = stillRef.current
    if (el && el.complete && el.naturalWidth === 0) setStillFailed(true)
  }, [stillSrc])

  return (
    <motion.div
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "relative mb-4 break-inside-avoid cursor-zoom-in rounded-xl overflow-hidden",
        className
      )}
      onClick={() => context.setSelected({ id, src, alt, kind, poster, title })}
    >
      {showStill ? (
        <motion.img
          ref={stillRef}
          layoutId={`image-${id}`}
          data-gallery-media
          src={stillSrc}
          alt={alt || title || "Gallery item"}
          onError={() => setStillFailed(true)}
          className="w-full h-auto object-cover rounded-xl"
          variants={{ hover: { scale: 0.98 }, tap: { scale: 0.95 } }}
          transition={spring}
        />
      ) : showFrame ? (
        <motion.video
          layoutId={`image-${id}`}
          data-gallery-media
          src={`${src}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          // The parent handles the click; the element is a still, not a player.
          className="pointer-events-none aspect-video w-full rounded-xl object-cover"
          onError={() => setFrameFailed(true)}
          variants={{ hover: { scale: 0.98 }, tap: { scale: 0.95 } }}
          transition={spring}
        />
      ) : (
        // Neither a poster nor a decodable frame: a titled tile, still the
        // shared element.
        <motion.div
          layoutId={`image-${id}`}
          data-gallery-media
          className="flex aspect-video w-full items-center justify-center rounded-xl bg-secondary p-4 text-center text-sm text-muted-foreground"
          variants={{ hover: { scale: 0.98 }, tap: { scale: 0.95 } }}
          transition={spring}
        >
          {title || alt || "Video"}
        </motion.div>
      )}

      {isVideo && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
          </span>
        </span>
      )}

      {/* Subtle hover overlay for premium feel */}
      <motion.div
        variants={{ hover: { opacity: 1 }, tap: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        className="absolute inset-0 bg-black/10 pointer-events-none rounded-xl"
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}

/**
 * Expanded view. Images are drag-to-dismiss; videos are not, so the drag
 * gesture can't fight the scrubber.
 */
function GalleryModal() {
  const context = React.useContext(GalleryContext)
  if (!context) return null

  const { selected, setSelected } = context
  if (!selected) return null

  const isVideo = selected.kind === "video"

  return (
    // Deliberately not wrapped in AnimatePresence. The expanded element shares
    // a layoutId with its thumbnail, and framer-motion holds an exiting subtree
    // while a shared-layout animation is pending — here it never settled,
    // leaving an invisible full-screen overlay mounted that swallowed every
    // click on the page. The thumbnail stays mounted and owns the same
    // layoutId, so the fly-back still animates without it.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Frosted glass backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
        onClick={() => setSelected(null)}
      />

      {isVideo ? (
        <div
          className="relative z-10 flex h-full w-full items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <motion.div
            layoutId={`image-${selected.id}`}
            transition={spring}
            className="max-w-[95vw]"
            // Keep clicks on the player from reaching the dismiss handler.
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selected.src}
              poster={selected.poster}
              controls
              autoPlay
              playsInline
              // Explicit width: without a working poster the element has no
              // intrinsic size until metadata loads and collapses to a sliver.
              className="h-auto w-[min(90vw,900px)] max-h-[90vh] rounded-xl shadow-2xl bg-black"
            />
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="relative z-10 w-full h-full flex items-center justify-center cursor-zoom-out"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.8}
          onDragEnd={(e, info) => {
            if (
              Math.abs(info.offset.y) > 100 ||
              Math.abs(info.velocity.y) > 300
            ) {
              setSelected(null)
            }
          }}
          onClick={() => setSelected(null)}
        >
          <motion.img
            layoutId={`image-${selected.id}`}
            src={selected.src}
            alt={selected.alt || "Selected gallery image"}
            className="w-auto h-auto max-w-[95vw] max-h-[90vh] rounded-xl shadow-2xl object-contain will-change-transform"
            draggable={false}
            transition={spring}
          />
        </motion.div>
      )}

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="absolute top-6 right-6 z-50 p-2.5 bg-white/10 text-white rounded-full backdrop-blur-md hover:bg-white/20 transition-colors"
        onClick={() => setSelected(null)}
        aria-label="Close gallery"
      >
        <X className="w-5 h-5" />
      </motion.button>
    </motion.div>
  )
}
