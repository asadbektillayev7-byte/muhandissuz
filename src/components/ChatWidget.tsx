'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { sendChatMessage } from '@/lib/chatActions'
import { botName, MAX_MESSAGE_CHARS, type ChatTurn } from '@/lib/chat'
import {
  copyForPath,
  routeKey,
  pick,
  pickList,
  DEFAULT_GREETING,
} from '@/lib/botMessages'

/**
 * Murvatcha / The Fixy — the site assistant, laid out like a Telegram chat:
 * tailed bubbles, timestamps inside the bubble, delivery ticks, a patterned
 * wallpaper and a round send button. Telegram's shapes, this site's colours,
 * so it reads as part of the page rather than a pasted-in widget.
 *
 * It sits above the bottom pill nav rather than beside it: the nav is centred
 * and can span most of the width on a phone.
 */

const AVATAR = '/images/murvatcha.jpg'

/** Above the pill nav, which sits 20px from the bottom and is 56px tall. */
const LAUNCHER_BOTTOM = 96
const LAUNCHER_SIZE = 56
const PANEL_BOTTOM = LAUNCHER_BOTTOM + LAUNCHER_SIZE + 12

/** How long the typing indicator runs before a message appears. */
const TYPING_MS = 1000
/** Wait before speaking unprompted, so the widget does not ambush a new page. */
const PROACTIVE_DELAY_MS = 4500
/** ...or as soon as this much of the page has been scrolled, whichever first. */
const PROACTIVE_SCROLL = 0.3

/** sessionStorage: one greeting per route, and never re-open after a close. */
const seenKey = (route: string) => `murvatcha:greeted:${route}`
const CLOSED_KEY = 'murvatcha:closed'

function sessionFlag(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === '1'
  } catch {
    // Private browsing can throw on access; treat it as "already greeted" so
    // a failure here stays quiet rather than repeating forever.
    return true
  }
}

function setSessionFlag(key: string) {
  try {
    window.sessionStorage.setItem(key, '1')
  } catch {
    // Nothing to do: worst case the greeting shows again next navigation.
  }
}

type Message = ChatTurn & { at: number }

function clockTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

/** Circular avatar; falls back to the initial if the image is missing. */
function Avatar({ size, name }: { size: number; name: string }) {
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  // A server-rendered <img> can finish failing before hydration, so the
  // onError handler alone would never fire.
  useEffect(() => {
    const el = ref.current
    if (el && el.complete && el.naturalWidth === 0) setFailed(true)
  }, [])

  if (failed) {
    return (
      <span
        className="flex shrink-0 items-center justify-center bg-accent font-semibold text-white"
        style={{ width: size, height: size, borderRadius: '50%', fontSize: size * 0.42 }}
      >
        {name.charAt(0)}
      </span>
    )
  }

  return (
    <img
      ref={ref}
      src={AVATAR}
      alt=""
      onError={() => setFailed(true)}
      className="shrink-0 object-cover"
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  )
}

/**
 * Renders the assistant's text, turning [label](/path) into a real link.
 *
 * Only same-site paths are honoured — a link must start with a single "/" and
 * not "//", which would be protocol-relative and leave the site. Anything else
 * is left as literal text rather than becoming a link to somewhere unknown,
 * because the href here is model output, not something we control.
 */
const LINK = /\[([^\]\n]+)\]\((\/[^)\s]*)\)/g

function renderText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let cursor = 0
  let m: RegExpExecArray | null
  LINK.lastIndex = 0

  while ((m = LINK.exec(text)) !== null) {
    const [full, label, href] = m
    if (m.index > cursor) parts.push(text.slice(cursor, m.index))

    if (href.startsWith('//')) {
      parts.push(full)
    } else {
      parts.push(
        <Link key={m.index} href={href} className="underline underline-offset-2">
          {label}
        </Link>
      )
    }
    cursor = m.index + full.length
  }

  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts
}

/**
 * The "..." shown before any assistant message, whether that message is the
 * proactive greeting or a real reply. One component for both, so the two are
 * indistinguishable to the visitor.
 */
function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1 px-3 py-2.5"
        style={{ backgroundColor: 'var(--card)', borderRadius: 12, borderBottomLeftRadius: 3 }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="chat-typing-dot block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--muted-foreground)' }}
          />
        ))}
      </div>
    </div>
  )
}

/** Telegram's little curved flick at the bottom corner of the last bubble. */
function Tail({ side, color }: { side: 'left' | 'right'; color: string }) {
  return (
    <svg
      width="9"
      height="20"
      viewBox="0 0 9 20"
      aria-hidden="true"
      className="absolute bottom-0"
      style={{
        [side]: -8,
        transform: side === 'left' ? 'scaleX(-1)' : undefined,
        color,
      }}
    >
      <path d="M0 4 C0 13 2 18 9 20 L0 20 Z" fill="currentColor" />
    </svg>
  )
}

export function ChatWidget() {
  const params = useParams()
  const pathname = usePathname()
  const locale = (params?.locale as string) === 'en' ? 'en' : 'uz'
  const uz = locale === 'uz'
  const name = botName(locale)

  const t = uz
    ? {
        open: `${name} bilan suhbat`,
        close: 'Yopish',
        status: 'bot · doim onlayn',
        placeholder: 'Xabar yozing…',
        send: 'Yuborish',
        typing: 'yozmoqda…',
        today: 'Bugun',
      }
    : {
        open: `Chat with ${name}`,
        close: 'Close',
        status: 'bot · always online',
        placeholder: 'Write a message…',
        send: 'Send',
        typing: 'typing…',
        today: 'Today',
      }

  // All assistant copy comes from lib/botMessages.ts, keyed by route.
  const routeCopy = copyForPath(pathname)
  const greetingText = pick(routeCopy?.greeting ?? DEFAULT_GREETING, locale)
  const suggestions = routeCopy ? pickList(routeCopy.suggestions, locale) : []

  const [open, setOpen] = useState(false)
  const [openedAt, setOpenedAt] = useState<number | null>(null)
  /** The greeting is held back until the typing indicator has run. */
  const [greetingReady, setGreetingReady] = useState(false)
  /**
   * Latched on the first send and never cleared. Keying the chips off the
   * message count instead would bring them back whenever a send failed and
   * its turn was rolled out.
   */
  const [hasSent, setHasSent] = useState(false)
  /**
   * The greeting text is frozen once shown. Reading it live would rewrite the
   * bubble under an existing conversation as soon as the visitor navigated.
   */
  const [shownGreeting, setShownGreeting] = useState<string | null>(null)
  const [turns, setTurns] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const greetedRoute = useRef(pathname)

  /**
   * Clearing this in an effect would be too late: the panel's first render
   * after a route change still carries the previous route's greetingReady,
   * so the old greeting paints for a frame and the typing indicator is
   * skipped entirely. Adjusting during render is the supported way to reset
   * state when a prop-like value changes.
   */
  if (greetedRoute.current !== pathname && !hasSent) {
    greetedRoute.current = pathname
    setGreetingReady(false)
    setShownGreeting(null)
    setOpenedAt(null)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, busy, open, error])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
  }, [open])

  /**
   * The greeting types itself out rather than appearing fully formed, exactly
   * like a real reply does — same indicator, same delay.
   *
   * It runs again when the route changes, because each section has its own
   * greeting, but never once the visitor has started talking: replacing the
   * top bubble mid-conversation would be disorienting.
   */
  useEffect(() => {
    if (!open || hasSent || greetingReady) return

    const id = setTimeout(() => {
      setShownGreeting(greetingText)
      setOpenedAt(Date.now())
      setGreetingReady(true)
    }, TYPING_MS)
    return () => clearTimeout(id)
  }, [open, pathname, hasSent, greetingReady, greetingText])

  /**
   * Speak first, at most once per route per session.
   *
   * Held back until the visitor has had a few seconds on the page, or has
   * scrolled far enough to be reading, so it lands as an offer rather than an
   * interruption. Closing the widget silences it for the rest of the session.
   */
  useEffect(() => {
    if (!routeCopy || hasSent) return

    const route = routeKey(pathname)
    if (sessionFlag(CLOSED_KEY) || sessionFlag(seenKey(route))) return

    let done = false
    const fire = () => {
      if (done) return
      // Never interrupt someone who already opened it and is mid-conversation.
      if (sessionFlag(CLOSED_KEY)) return
      done = true
      setSessionFlag(seenKey(route))
      setOpen(true)
    }

    const timer = setTimeout(fire, PROACTIVE_DELAY_MS)
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= PROACTIVE_SCROLL) fire()
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname, routeCopy, hasSent])

  function close() {
    setOpen(false)
    // Re-opening should type the greeting out again rather than showing a
    // stale one instantly.
    if (!hasSent) {
      setGreetingReady(false)
      setShownGreeting(null)
      setOpenedAt(null)
    }
    // A closed widget stays closed: no further route may re-open it.
    setSessionFlag(CLOSED_KEY)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  async function send(preset?: string) {
    const text = (preset ?? input).trim()
    if (!text || busy) return
    setHasSent(true)

    const outgoing: Message = { role: 'user', text, at: Date.now() }
    const next = [...turns, outgoing]
    setTurns(next)
    setInput('')
    setError('')
    setBusy(true)

    const [result] = await Promise.all([
      sendChatMessage(
        next.map(({ role, text }) => ({ role, text })),
        locale
      ),
      // Floor the wait so a quick reply still shows the indicator rather than
      // flashing it for a frame.
      new Promise((r) => setTimeout(r, TYPING_MS)),
    ])

    if ('reply' in result) {
      setTurns([...next, { role: 'model', text: result.reply, at: Date.now() }])
    } else {
      // Roll the failed turn back out and hand the text to the input again.
      // Leaving it in would put two user turns in a row, which the API
      // rejects — every later message would then fail too.
      setTurns(turns)
      setInput(text)
      setError(result.error)
    }
    setBusy(false)
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={name}
          className="fixed right-4 z-[60] flex w-[min(calc(100vw-2rem),23rem)] flex-col overflow-hidden border shadow-2xl"
          style={{
            bottom: PANEL_BOTTOM,
            height: 'min(30rem, calc(100vh - 14rem))',
            borderColor: 'var(--border)',
            borderRadius: '12px',
            backgroundColor: 'var(--card)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 border-b px-3 py-2.5"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <Avatar size={38} name={name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{name}</p>
              <p className="truncate text-xs leading-tight text-muted-foreground">
                {busy ? t.typing : t.status}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="px-1 text-xl leading-none text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>

          {/* Conversation, on a Telegram-style patterned wallpaper. The dots
              are neutral grey at low alpha, so one value reads correctly on
              both the light and the dark surface. */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3"
            style={{
              backgroundColor: 'var(--secondary)',
              backgroundImage: 'radial-gradient(rgba(128,128,128,0.18) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          >
            <div className="flex justify-center pb-1">
              <span
                className="px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                style={{ backgroundColor: 'var(--card)', borderRadius: '999px' }}
              >
                {t.today}
              </span>
            </div>

            {/* Not gated on openedAt: that timestamp is only set when the
                greeting lands, which is precisely when the dots stop. */}
            {!greetingReady && <TypingBubble />}

            {openedAt !== null && greetingReady && (
              <Bubble role="model" at={openedAt} lastOfGroup={turns[0]?.role !== 'model'}>
                {shownGreeting ?? greetingText}
              </Bubble>
            )}

            {turns.map((m, i) => (
              <Bubble
                key={i}
                role={m.role}
                at={m.at}
                lastOfGroup={turns[i + 1]?.role !== m.role}
                delivered={m.role === 'user' ? i < turns.length - 1 || !busy : undefined}
              >
                {m.text}
              </Bubble>
            ))}

            {busy && <TypingBubble />}

            {error && (
              <div className="flex justify-center pt-1">
                <span
                  className="max-w-[85%] px-2.5 py-1 text-center text-[11px] text-destructive"
                  style={{ backgroundColor: 'var(--card)', borderRadius: '999px' }}
                >
                  {error}
                </span>
              </div>
            )}
          </div>

          {/* Suggested questions. Offered once, at the start of a chat, and
              gone as soon as the visitor has said anything — they are a way in,
              not a menu that reappears under every reply. */}
          {suggestions.length > 0 && !hasSent && greetingReady && (
            <div
              className="flex flex-wrap gap-1.5 border-t px-3 pb-1 pt-2.5"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              {suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={busy}
                  className="border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-chart-2 hover:text-chart-2 disabled:opacity-50"
                  style={{ borderColor: 'var(--border)', borderRadius: '999px' }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2 px-3 py-2.5"
            style={{
              borderTop:
                suggestions.length > 0 && !hasSent && greetingReady
                  ? 'none'
                  : '1px solid var(--border)',
              backgroundColor: 'var(--card)',
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              className="min-w-0 flex-1 border bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:border-chart-2"
              style={{ borderColor: 'var(--border)', borderRadius: '999px' }}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label={t.send}
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
              style={{ borderRadius: '50%' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? t.close : t.open}
        aria-expanded={open}
        className="fixed right-4 z-[60] overflow-hidden shadow-lg transition-transform hover:scale-105"
        style={{
          bottom: LAUNCHER_BOTTOM,
          width: LAUNCHER_SIZE,
          height: LAUNCHER_SIZE,
          borderRadius: '50%',
          border: '2px solid var(--accent)',
          backgroundColor: 'var(--card)',
        }}
      >
        <Avatar size={LAUNCHER_SIZE - 4} name={name} />
      </button>
    </>
  )
}

function Bubble({
  role,
  at,
  children,
  lastOfGroup,
  delivered,
}: {
  role: 'user' | 'model'
  at: number
  children: React.ReactNode
  lastOfGroup: boolean
  delivered?: boolean
}) {
  const isUser = role === 'user'
  // accent-hover, not accent: white on the lighter accent measures 3.68:1,
  // under the 4.5:1 needed for body text. The deeper blue reaches 5.2:1 and
  // still reads as the same colour.
  const bg = isUser ? 'var(--accent-hover)' : 'var(--card)'

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className="relative max-w-[80%] px-2.5 pb-1.5 pt-1.5"
        style={{
          backgroundColor: bg,
          color: isUser ? '#fff' : 'var(--card-foreground)',
          borderRadius: 12,
          // Telegram squares off the corner the tail grows from.
          borderBottomRightRadius: isUser && lastOfGroup ? 3 : 12,
          borderBottomLeftRadius: !isUser && lastOfGroup ? 3 : 12,
        }}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-snug">
          {typeof children === 'string' && !isUser ? renderText(children) : children}
          {/* Reserves room on the last line so the timestamp never overlaps
              the text, which is exactly how Telegram does it. */}
          <span className="inline-block w-[52px]" aria-hidden="true" />
        </p>

        <span
          className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[10px] leading-none"
          style={{ color: isUser ? 'rgba(255,255,255,0.75)' : 'var(--muted-foreground)' }}
        >
          {clockTime(at)}
          {isUser && (
            <svg width="14" height="10" viewBox="0 0 16 11" fill="none" aria-hidden="true">
              <path
                d="M1 5.5 4 8.5 9.5 2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* The second tick only appears once the reply is back, so it
                  means "answered", not "a human read it". */}
              {delivered && (
                <path
                  d="M6.5 8 11.5 2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          )}
        </span>

        {lastOfGroup && <Tail side={isUser ? 'right' : 'left'} color={bg} />}
      </div>
    </div>
  )
}
