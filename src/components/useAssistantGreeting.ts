'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { copyForPath, greetingSection, pick } from '@/lib/botMessages'

export const GREETING_DELAY_MS = 3500
export const greetingSessionKey = (section: string, locale: string) => `murvachcha:greeted:v2:${locale}:${section}`

/** Fixed copy only: welcoming a visitor never calls the chat API. */
export function useAssistantGreeting({ pathname, locale, open, dragging }: {
  pathname: string; locale: string; open: boolean; dragging: boolean
}) {
  const section = greetingSection(pathname)
  const key = section ? greetingSessionKey(section, locale) : null
  const copy = copyForPath(pathname)
  const text = copy ? pick(copy.greeting, locale) : null
  const seen = useRef(new Set<string>())
  const [greeting, setGreeting] = useState<{ pathname: string; key: string; text: string } | null>(null)

  const remember = useCallback(() => {
    if (!key) return
    seen.current.add(key)
    try { sessionStorage.setItem(key, '1') } catch { /* In-memory deduplication still works when storage is blocked. */ }
  }, [key])

  const dismiss = useCallback(() => {
    remember()
    setGreeting(null)
  }, [remember])

  useEffect(() => {
    // Remove old copy on navigation, including detail pages in the same section.
    setGreeting(previous => previous?.pathname === pathname && previous.key === key ? previous : null)
    if (!key || !text) return
    if (open) { dismiss(); return }
    if (dragging) return
    let alreadySeen = seen.current.has(key)
    try { alreadySeen ||= sessionStorage.getItem(key) === '1' } catch { /* Use the in-memory set. */ }
    if (alreadySeen) return

    let timer: number | undefined
    const schedule = () => {
      window.clearTimeout(timer)
      // Give a visitor time to see the page; background tabs don't consume it.
      if (document.hidden || seen.current.has(key)) return
      timer = window.setTimeout(() => {
        if (seen.current.has(key)) return
        remember()
        setGreeting({ pathname, key, text })
      }, GREETING_DELAY_MS)
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [pathname, key, text, open, dragging, dismiss, remember])

  return {
    teaser: !open && !dragging && greeting?.pathname === pathname && greeting.key === key ? greeting.text : null,
    dismiss,
  }
}
