import assert from 'node:assert/strict'
import test from 'node:test'
import { register } from 'node:module'
import { JSDOM } from 'jsdom'

// Exercise the actual widget and positioning hook without Next routing or a
// live chat request. JSDOM supplies events; layout and pointer capture are the
// only browser mechanics stubbed below.
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (specifier === './MurvachchaMascot') return { shortCircuit: true, url: 'data:text/javascript,export%20function%20MurvachchaMascot()%7Breturn%20null%7D' };
  return nextResolve(specifier, context);
}
export async function load(url, context, nextLoad) {
  if (url.endsWith('.module.css')) return { format: 'module', shortCircuit: true, source: 'export default new Proxy({}, {get: (_, key) => String(key)})' };
  if (url.endsWith('/next/navigation.js')) return { format: 'module', shortCircuit: true, source: 'export const useParams = () => ({locale:"uz"}); export const usePathname = () => "/uz";' };
  if (url.endsWith('/next/link.js')) return { format: 'module', shortCircuit: true, source: 'import {createElement} from "react"; export default function Link(props) { return createElement("a",props); }' };
  if (url.endsWith('/src/lib/chatActions.ts')) return { format: 'module', shortCircuit: true, source: 'export const sendChatMessage = (...args) => globalThis.__assistantChatMock(...args);' };
  return nextLoad(url, context);
}`)}`, import.meta.url)

test('assistant supports mouse/touch dragging, safe placement, persistence and normal chat activation', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    pretendToBeVisual: true, url: 'https://widget.example.test/uz',
  })
  const window = dom.window
  const globals = globalThis as unknown as Record<string, unknown>
  const descriptors = new Map<string, PropertyDescriptor | undefined>()
  for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'Element', 'Node', 'Event', 'MouseEvent', 'PointerEvent', 'KeyboardEvent', 'localStorage', 'sessionStorage', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
    descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name))
    const value = name === 'window' ? window : (window as unknown as Record<string, unknown>)[name]
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: typeof value === 'function' && ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(name) ? value.bind(window) : value })
  }
  const oldAct = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  let chatCalls = 0
  globals.__assistantChatMock = async () => { chatCalls++; return { reply: 'Local test reply' } }
  // Keep unrelated timed greetings quiet while testing deliberate movement.
  window.sessionStorage.setItem('murvatcha:closed', '1')
  const viewport = Object.assign(new window.EventTarget(), { width: 1280, height: 900, offsetLeft: 0, offsetTop: 0, scale: 1 })
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
  const resize = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
    Object.defineProperty(window.document.documentElement, 'clientWidth', { configurable: true, value: width })
    Object.defineProperty(window.document.documentElement, 'clientHeight', { configurable: true, value: height })
    viewport.width = width; viewport.height = height
    window.dispatchEvent(new window.Event('resize'))
    viewport.dispatchEvent(new window.Event('resize'))
  }
  resize(1280, 900)
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: (query: string) => ({
    matches: query.includes('prefers-reduced-motion'), media: query, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true },
  }) })
  const captures = new WeakMap<Element, number>()
  window.HTMLElement.prototype.setPointerCapture = function (id: number) { captures.set(this, id) }
  window.HTMLElement.prototype.releasePointerCapture = function (id: number) { if (captures.get(this) === id) captures.delete(this) }
  window.HTMLElement.prototype.hasPointerCapture = function (id: number) { return captures.get(this) === id }
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    const left = parseFloat(this.style.left) || 0
    const top = parseFloat(this.style.top) || 0
    const width = parseFloat(this.style.width) || (this.classList.contains('murvachcha-control') ? (window.innerWidth < 640 ? 88 : 104) : 368)
    const height = parseFloat(this.style.height) || (this.classList.contains('murvachcha-control') ? (window.innerWidth < 640 ? 108 : 128) : 480)
    return { left, top, right: left + width, bottom: top + height, width, height, x: left, y: top, toJSON() { return {} } }
  }

  const { createElement, act } = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { ChatWidget } = await import('../src/components/ChatWidget')
  const container = window.document.getElementById('root')!
  let root = createRoot(container)
  const launcher = () => window.document.querySelector<HTMLButtonElement>('.murvachcha-control')!
  const position = () => ({ x: parseFloat(launcher().style.left), y: parseFloat(launcher().style.top) })
  const dialog = () => window.document.querySelector('#murvachcha-chat-panel')
  const storageKey = 'murvachcha:position:v1'
  const settle = () => new Promise(resolve => setTimeout(resolve, 30))
  const pointer = async (type: string, x: number, y: number, pointerType = 'mouse', pointerId = 1, button = 0) => {
    await act(async () => {
      launcher().dispatchEvent(new window.PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerType, pointerId, isPrimary: true, button, buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1 }))
      await settle()
    })
  }
  const click = async (detail: number) => { await act(async () => { launcher().dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, detail })) }) }
  const key = async (key: string, extras: KeyboardEventInit = {}) => { await act(async () => { launcher().dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, cancelable: true, key, ...extras })); await settle() }) }
  const drag = async (dx: number, dy: number, pointerType = 'mouse', pointerId = 1) => {
    const before = position()
    const x = before.x + 30, y = before.y + 30
    await pointer('pointerdown', x, y, pointerType, pointerId)
    await pointer('pointermove', x + dx, y + dy, pointerType, pointerId)
    await pointer('pointerup', x + dx, y + dy, pointerType, pointerId)
    return before
  }
  const assertInsideViewport = () => {
    const rect = launcher().getBoundingClientRect()
    assert.ok(rect.left >= viewport.offsetLeft && rect.top >= viewport.offsetTop, JSON.stringify(rect))
    assert.ok(rect.right <= viewport.offsetLeft + viewport.width && rect.bottom <= viewport.offsetTop + viewport.height - 96, JSON.stringify(rect))
  }
  const assertDialogInsideViewport = () => {
    assert.ok(dialog())
    const rect = (dialog() as HTMLElement).getBoundingClientRect()
    assert.ok(rect.left >= viewport.offsetLeft && rect.top >= viewport.offsetTop, JSON.stringify(rect))
    assert.ok(rect.right <= viewport.offsetLeft + viewport.width && rect.bottom <= viewport.offsetTop + viewport.height, JSON.stringify(rect))
    assert.ok(rect.width > 0 && rect.height > 0)
  }
  const closeWithEscape = async () => {
    await act(async () => { window.document.dispatchEvent(new window.KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })) })
    assert.equal(dialog(), null)
    assert.equal(window.document.activeElement, launcher(), 'closing chat restores keyboard focus to the launcher')
  }
  try {
    await act(async () => { root.render(createElement(ChatWidget)); await settle() })
    assert.ok(launcher())
    assert.equal(launcher().getAttribute('aria-expanded'), 'false')
    assert.ok(window.document.getElementById('murvachcha-move-instructions'))
    assertInsideViewport()
    const initial = position()

    const beforeMouse = await drag(-180, -90)
    assert.ok(Math.abs(position().x - (beforeMouse.x - 180)) <= 1)
    assert.ok(Math.abs(position().y - (beforeMouse.y - 90)) <= 1)
    await click(1)
    assert.equal(dialog(), null, 'the synthetic click after a drag must not open chat')
    const stored = JSON.parse(window.localStorage.getItem(storageKey)!)
    assert.ok(stored.x >= 0 && stored.x <= 1 && stored.y >= 0 && stored.y <= 1)

    const beforeTouch = await drag(-70, -45, 'touch', 4)
    assert.ok(Math.abs(position().x - (beforeTouch.x - 70)) <= 1)
    assert.ok(Math.abs(position().y - (beforeTouch.y - 45)) <= 1)
    await click(1)
    assert.equal(dialog(), null)
    const persisted = position()
    await act(async () => { root.unmount() })
    root = createRoot(container)
    await act(async () => { root.render(createElement(ChatWidget)); await settle() })
    assert.deepEqual(position(), persisted, 'remount restores the visitor’s chosen spot')

    // A tiny movement is a click, and keyboard activation must remain usable
    // even after a previous drag suppressed a pointer-generated click.
    await drag(2, 1)
    await click(1)
    assert.ok(dialog(), 'movement below the drag threshold still opens chat')
    await closeWithEscape()
    await drag(-15, -15)
    await click(0)
    assert.ok(dialog(), 'keyboard-generated click is never consumed as drag fallout')
    await act(async () => { (dialog()!.querySelector('button[aria-label="Yopish"]') as HTMLButtonElement).click() })
    assert.equal(dialog(), null)

    const beforeKeys = position()
    await key('ArrowLeft', { altKey: true })
    assert.ok(Math.abs(position().x - (beforeKeys.x - 16)) < 0.01)
    await key('ArrowUp', { altKey: true, shiftKey: true })
    assert.ok(Math.abs(position().y - (beforeKeys.y - 48)) < 0.01)
    assert.equal(dialog(), null)

    // Cancellation restores the start instead of committing accidental movement.
    const beforeCancel = position()
    const savedBeforeCancel = window.localStorage.getItem(storageKey)
    await pointer('pointerdown', beforeCancel.x + 20, beforeCancel.y + 20, 'touch', 6)
    await pointer('pointermove', beforeCancel.x - 50, beforeCancel.y - 50, 'touch', 6)
    await pointer('pointercancel', beforeCancel.x - 50, beforeCancel.y - 50, 'touch', 6)
    assert.deepEqual(position(), beforeCancel)
    assert.equal(window.localStorage.getItem(storageKey), savedBeforeCancel)
    await click(1)
    assert.equal(dialog(), null)

    await act(async () => { resize(390, 844); await settle() })
    assertInsideViewport()
    await drag(-5000, -5000, 'touch', 8)
    assertInsideViewport()
    await click(0)
    assertDialogInsideViewport()
    await closeWithEscape()
    await drag(5000, 5000, 'touch', 9)
    assertInsideViewport()
    await click(0)
    assertDialogInsideViewport()
    // The on-screen keyboard can shrink and offset visualViewport while the
    // page's layout viewport remains tall. Keep the open chat fully visible.
    await act(async () => {
      viewport.offsetTop = 120; viewport.height = 300
      viewport.dispatchEvent(new window.Event('resize'))
      await settle()
    })
    assertDialogInsideViewport()
    await closeWithEscape()
    await act(async () => { viewport.offsetTop = 0; resize(390, 844); await settle() })
    await key('Home')
    const reset = position()
    assert.ok(reset.x > 200 && reset.y > 500, 'Home puts the mascot back above the mobile pill navigation')
    await act(async () => { window.document.documentElement.classList.add('dark'); await settle() })
    assert.deepEqual(position(), reset, 'theme changes do not reset placement')
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 120)) })
    assert.deepEqual(position(), reset, 'idle animation does not roam across the screen')
    assert.notDeepEqual(position(), initial)
    assert.equal(chatCalls, 0, 'moving/opening the assistant never sends a message')

    await act(async () => { root.unmount() })
    window.localStorage.setItem(storageKey, '{"x":null,"y":"bad"}')
    root = createRoot(container)
    await act(async () => { root.render(createElement(ChatWidget)); await settle() })
    assert.deepEqual(position(), reset, 'malformed saved coordinates fall back to the usable default')
    await act(async () => { root.unmount() })
    window.localStorage.setItem(storageKey, '{"x":99,"y":-99}')
    root = createRoot(container)
    await act(async () => { root.render(createElement(ChatWidget)); await settle() })
    assertInsideViewport()
    assert.equal(position().x, reset.x)
    assert.equal(position().y, 16)
  } finally {
    await act(async () => { root.unmount() })
    delete globals.__assistantChatMock
    if (oldAct === undefined) delete globals.IS_REACT_ACT_ENVIRONMENT
    else globals.IS_REACT_ACT_ENVIRONMENT = oldAct
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else Reflect.deleteProperty(globalThis, name)
    }
    window.close()
  }
})
