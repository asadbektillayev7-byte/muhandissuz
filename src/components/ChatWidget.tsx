'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { sendChatMessage } from '@/lib/chatActions'
import { BOT_NAME, MAX_MESSAGE_CHARS, type ChatTurn } from '@/lib/chat'

/**
 * Murvatcha — the site assistant.
 *
 * Sits above the bottom pill nav rather than beside it: the nav is centred and
 * can span most of the width on a phone, so a bubble at the same height would
 * collide with it.
 */

/** Above the pill nav, which sits 20px from the bottom and is 56px tall. */
const LAUNCHER_BOTTOM = 96
const LAUNCHER_SIZE = 48
/** The panel stacks above the launcher, with a gap. */
const PANEL_BOTTOM = LAUNCHER_BOTTOM + LAUNCHER_SIZE + 12

function GearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.31.4.56.72.68H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function ChatWidget() {
  const params = useParams()
  const locale = (params?.locale as string) === 'en' ? 'en' : 'uz'
  const uz = locale === 'uz'

  const t = uz
    ? {
        open: `${BOT_NAME} bilan suhbat`,
        close: 'Yopish',
        title: BOT_NAME,
        subtitle: 'Sayt bo‘yicha yordamchi',
        greeting: `Salom! Men ${BOT_NAME}, Muhandiss.uz yordamchisiman. Sayt bo‘yicha yoki muhandislik haqida savolingiz bo‘lsa, yozing.`,
        placeholder: 'Savolingizni yozing…',
        send: 'Yuborish',
        thinking: 'O‘ylayapti…',
        disclaimer: 'Sun’iy intellekt javoblari xato bo‘lishi mumkin.',
      }
    : {
        open: `Chat with ${BOT_NAME}`,
        close: 'Close',
        title: BOT_NAME,
        subtitle: 'Site assistant',
        greeting: `Hello! I'm ${BOT_NAME}, the Muhandiss.uz assistant. Ask me about the site or about engineering.`,
        placeholder: 'Type your question…',
        send: 'Send',
        thinking: 'Thinking…',
        disclaimer: 'AI answers can be wrong.',
      }

  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, busy, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || busy) return

    const next: ChatTurn[] = [...turns, { role: 'user', text }]
    setTurns(next)
    setInput('')
    setError('')
    setBusy(true)

    const result = await sendChatMessage(next, locale)
    if ('reply' in result) {
      setTurns([...next, { role: 'model', text: result.reply }])
    } else {
      // Roll the failed turn back out and hand the text to the input again.
      // Leaving it in would put two user turns in a row, which the API
      // rejects — every later message in the conversation would then fail.
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
          aria-label={t.title}
          className="fixed right-4 z-[60] flex w-[min(calc(100vw-2rem),22rem)] flex-col border shadow-xl"
          style={{
            bottom: PANEL_BOTTOM,
            height: 'min(26rem, calc(100vh - 14rem))',
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div
            className="flex items-center gap-2 border-b px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <GearIcon className="h-4 w-4 text-chart-2" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">{t.title}</p>
              <p className="text-xs text-muted-foreground leading-tight">{t.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="text-muted-foreground hover:text-foreground text-lg leading-none px-1"
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {/* The greeting is local, not a model call — it costs nothing and
                is always there the moment the panel opens. */}
            <Bubble role="model">{t.greeting}</Bubble>

            {turns.map((turn, i) => (
              <Bubble key={i} role={turn.role}>
                {turn.text}
              </Bubble>
            ))}

            {busy && <p className="text-xs text-muted-foreground">{t.thinking}</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="border-t px-3 py-3" style={{ borderColor: 'var(--border)' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_CHARS))}
                placeholder={t.placeholder}
                aria-label={t.placeholder}
                className="min-w-0 flex-1 border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-chart-2"
                style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                style={{ borderRadius: 'var(--radius)' }}
              >
                {t.send}
              </button>
            </form>
            <p className="mt-2 text-[11px] text-muted-foreground">{t.disclaimer}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t.close : t.open}
        aria-expanded={open}
        // Accent, not card: a card-coloured bubble sits at 1.05:1 against the
        // page in both themes, which is invisible for something meant to be
        // noticed.
        className="fixed right-4 z-[60] flex h-12 w-12 items-center justify-center bg-accent text-white shadow-lg transition-colors hover:bg-accent-hover"
        style={{ bottom: LAUNCHER_BOTTOM, borderRadius: '999px' }}
      >
        <GearIcon className="h-5 w-5" />
      </button>
    </>
  )
}

function Bubble({ role, children }: { role: 'user' | 'model'; children: React.ReactNode }) {
  const isUser = role === 'user'
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <p
        className={
          'max-w-[85%] whitespace-pre-wrap px-3 py-2 text-sm ' +
          (isUser ? 'text-white' : 'text-foreground')
        }
        style={{
          backgroundColor: isUser ? 'var(--accent)' : 'var(--secondary)',
          borderRadius: 'var(--radius)',
        }}
      >
        {children}
      </p>
    </div>
  )
}
