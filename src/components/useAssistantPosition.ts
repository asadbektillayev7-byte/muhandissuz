'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import {
  ASSISTANT_DRAG_THRESHOLD,
  ASSISTANT_POSITION_KEY,
  assistantOverlayLayout,
  assistantPositionFromRatio,
  assistantPositionToRatio,
  assistantSize,
  type AssistantPoint,
  type AssistantViewport,
} from '@/lib/assistant-position'

type Gesture = {
  id: number
  origin: AssistantPoint
  start: AssistantPoint
  previousRatio: AssistantPoint
  moved: boolean
  target: HTMLButtonElement
}

const DEFAULT_POSITION = { x: 1, y: 1 }

function currentViewport(): AssistantViewport {
  const visible = window.visualViewport
  return {
    left: visible?.offsetLeft ?? 0,
    top: visible?.offsetTop ?? 0,
    width: visible?.width || window.innerWidth,
    height: visible?.height || window.innerHeight,
  }
}

function remember(ratio: AssistantPoint) {
  try { window.localStorage.setItem(ASSISTANT_POSITION_KEY, JSON.stringify(ratio)) } catch { /* Storage can be blocked in private browsing. */ }
}

function readRememberedPosition(): AssistantPoint {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(ASSISTANT_POSITION_KEY) || 'null')
    if (stored && typeof stored === 'object' && 'x' in stored && 'y' in stored &&
      typeof stored.x === 'number' && Number.isFinite(stored.x) && typeof stored.y === 'number' && Number.isFinite(stored.y)) {
      return { x: Math.min(1, Math.max(0, stored.x)), y: Math.min(1, Math.max(0, stored.y)) }
    }
  } catch { /* Ignore malformed or unavailable storage. */ }
  return DEFAULT_POSITION
}

export function useAssistantPosition() {
  const [viewport, setViewport] = useState<AssistantViewport | null>(null)
  const [ratio, setRatio] = useState<AssistantPoint>(DEFAULT_POSITION)
  const [dragging, setDragging] = useState(false)
  const [teaserHeight, setTeaserHeight] = useState(144)
  const viewportRef = useRef<AssistantViewport | null>(null)
  const ratioRef = useRef(ratio)
  const gestureRef = useRef<Gesture | null>(null)
  const suppressClick = useRef(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const teaserObserver = useRef<ResizeObserver | null>(null)

  const updateRatio = useCallback((next: AssistantPoint) => {
    ratioRef.current = next
    setRatio(next)
  }, [])

  const finishGesture = useCallback((cancelled: boolean) => {
    const gesture = gestureRef.current
    if (!gesture) return
    // Clear first: releasing capture can synchronously dispatch lostcapture.
    gestureRef.current = null
    if (cancelled) updateRatio(gesture.previousRatio)
    else if (gesture.moved) remember(ratioRef.current)
    suppressClick.current = cancelled || gesture.moved
    setDragging(false)
    try {
      if (gesture.target.hasPointerCapture(gesture.id)) gesture.target.releasePointerCapture(gesture.id)
    } catch { /* The browser can release capture before cancellation arrives. */ }
  }, [updateRatio])

  useEffect(() => {
    updateRatio(readRememberedPosition())
    const sync = () => {
      finishGesture(true)
      const next = currentViewport()
      viewportRef.current = next
      setViewport(next)
    }
    const cancel = () => finishGesture(true)
    sync()
    const visible = window.visualViewport
    window.addEventListener('resize', sync)
    window.addEventListener('blur', cancel)
    visible?.addEventListener('resize', sync)
    visible?.addEventListener('scroll', sync)
    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('blur', cancel)
      visible?.removeEventListener('resize', sync)
      visible?.removeEventListener('scroll', sync)
      teaserObserver.current?.disconnect()
      const gesture = gestureRef.current
      gestureRef.current = null
      try { if (gesture?.target.hasPointerCapture(gesture.id)) gesture.target.releasePointerCapture(gesture.id) } catch { /* Already released. */ }
    }
  }, [finishGesture, updateRatio])

  const teaserRef = useCallback((element: HTMLDivElement | null) => {
    teaserObserver.current?.disconnect()
    teaserObserver.current = null
    if (!element) return
    const measure = () => {
      const height = Math.ceil(Math.max(element.scrollHeight + 2, element.getBoundingClientRect().height))
      if (height > 2) setTeaserHeight(previous => previous === height ? previous : height)
    }
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      teaserObserver.current = new ResizeObserver(measure)
      teaserObserver.current.observe(element)
    }
  }, [])

  const onPointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0 || gestureRef.current) return
    const visible = viewportRef.current ?? currentViewport()
    gestureRef.current = {
      id: event.pointerId,
      origin: { x: event.clientX, y: event.clientY },
      start: assistantPositionFromRatio(ratioRef.current, visible, assistantSize(visible)),
      previousRatio: ratioRef.current,
      moved: false,
      target: event.currentTarget,
    }
    suppressClick.current = false
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* Capture is optional on older browsers. */ }
  }, [])

  const onPointerMove = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    const gesture = gestureRef.current
    if (!gesture || event.pointerId !== gesture.id) return
    const dx = event.clientX - gesture.origin.x
    const dy = event.clientY - gesture.origin.y
    if (!gesture.moved && Math.hypot(dx, dy) < ASSISTANT_DRAG_THRESHOLD) return
    if (!gesture.moved) { gesture.moved = true; setDragging(true) }
    event.preventDefault()
    const visible = viewportRef.current ?? currentViewport()
    updateRatio(assistantPositionToRatio({ x: gesture.start.x + dx, y: gesture.start.y + dy }, visible, assistantSize(visible)))
  }, [updateRatio])

  const onPointerUp = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (gestureRef.current?.id === event.pointerId) finishGesture(false)
  }, [finishGesture])

  const onPointerCancel = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (gestureRef.current?.id === event.pointerId) finishGesture(true)
  }, [finishGesture])

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Home') {
      event.preventDefault()
      finishGesture(true)
      updateRatio(DEFAULT_POSITION)
      remember(DEFAULT_POSITION)
      return
    }
    if (!event.altKey || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    finishGesture(true)
    const visible = viewportRef.current ?? currentViewport()
    const size = assistantSize(visible)
    const point = assistantPositionFromRatio(ratioRef.current, visible, size)
    const step = event.shiftKey ? 48 : 16
    const next = assistantPositionToRatio({
      x: point.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0),
      y: point.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0),
    }, visible, size)
    updateRatio(next)
    remember(next)
  }, [finishGesture, updateRatio])

  const shouldHandleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    if (suppressClick.current && event.detail !== 0) {
      suppressClick.current = false
      event.preventDefault()
      event.stopPropagation()
      return false
    }
    return true
  }, [])

  const visible = viewport ?? { left: 0, top: 0, width: 1024, height: 768 }
  const size = assistantSize(visible)
  const point = assistantPositionFromRatio(ratio, visible, size)
  const panel = assistantOverlayLayout(point, visible, size, { width: 368, height: 480 })
  const teaser = assistantOverlayLayout(point, visible, size, { width: 272, height: teaserHeight })
  const launcherStyle: CSSProperties = {
    ...(viewport ? { left: point.x, top: point.y } : { right: 16, bottom: 96 }),
    width: size.width,
    height: size.height,
    touchAction: 'none',
    userSelect: 'none',
    cursor: dragging ? 'grabbing' : 'grab',
  }
  const panelStyle: CSSProperties = { left: panel.left, top: panel.top, width: panel.width, height: panel.height }
  const teaserStyle: CSSProperties = { left: teaser.left, top: teaser.top, width: teaser.width, maxHeight: teaser.height, overflowY: 'auto' }

  return {
    launcherRef, teaserRef, launcherStyle, panelStyle, teaserStyle, dragging, side: panel.side,
    onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture: onPointerCancel,
    onKeyDown, shouldHandleClick,
  }
}
