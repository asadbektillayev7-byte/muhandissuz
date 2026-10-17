import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assistantSize, assistantBounds, clampAssistantPosition, assistantPositionFromRatio,
  assistantPositionToRatio, assistantOverlayLayout,
  type AssistantViewport, type AssistantPoint,
} from '../src/lib/assistant-position'

const desktop = { left: 0, top: 0, width: 1280, height: 900 }
const mobile = { left: 0, top: 0, width: 390, height: 844 }

test('assistant placement stays above navigation and normalized positions adapt to mobile', () => {
  const large = assistantSize(desktop)
  assert.deepEqual(large, { width: 104, height: 128 })
  assert.deepEqual(assistantSize(mobile), { width: 88, height: 108 })
  const initial = assistantPositionFromRatio({ x: 1, y: 1 }, desktop, large)
  assert.ok(initial.x + large.width <= desktop.width - 16)
  assert.equal(initial.y + large.height, desktop.height - 96)
  assert.deepEqual(clampAssistantPosition({ x: -10000, y: 10000 }, desktop, large), { x: 16, y: desktop.height - 96 - large.height })

  const chosen = { x: 500, y: 300 }
  const ratio = assistantPositionToRatio(chosen, desktop, large)
  const restored = assistantPositionFromRatio(ratio, desktop, large)
  assert.ok(Math.abs(restored.x - chosen.x) < 0.01 && Math.abs(restored.y - chosen.y) < 0.01)
  const onPhone = assistantPositionFromRatio(ratio, mobile, assistantSize(mobile))
  const phoneBounds = assistantBounds(mobile, assistantSize(mobile))
  assert.ok(onPhone.x >= phoneBounds.minX && onPhone.x <= phoneBounds.maxX)
  assert.ok(onPhone.y >= phoneBounds.minY && onPhone.y <= phoneBounds.maxY)
  assert.notDeepEqual(onPhone, chosen)
})

function checkOverlay(viewport: AssistantViewport, ratio: AssistantPoint, separate: boolean) {
  const size = assistantSize(viewport)
  const point = assistantPositionFromRatio(ratio, viewport, size)
  const overlay = assistantOverlayLayout(point, viewport, size, { width: 368, height: 480 })
  for (const value of [overlay.left, overlay.top, overlay.width, overlay.height]) assert.ok(Number.isFinite(value))
  assert.ok(overlay.width > 0 && overlay.height > 0)
  assert.ok(overlay.left >= viewport.left && overlay.top >= viewport.top)
  assert.ok(overlay.left + overlay.width <= viewport.left + viewport.width)
  assert.ok(overlay.top + overlay.height <= viewport.top + viewport.height)
  if (separate) {
    const intersects = overlay.left < point.x + size.width && overlay.left + overlay.width > point.x &&
      overlay.top < point.y + size.height && overlay.top + overlay.height > point.y
    assert.equal(intersects, false, `chat must remain separate from its launcher: ${JSON.stringify({ viewport, point, overlay })}`)
  }
  return overlay
}

test('chat stays visible and clear of the mascot at corners and middle on desktop/mobile', () => {
  for (const viewport of [desktop, mobile]) {
    for (const ratio of [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0.5, y: 0.5 }]) {
      const overlay = checkOverlay(viewport, ratio, true)
      assert.ok(overlay.top + overlay.height <= viewport.height - 96, 'chat avoids the pill navigation')
    }
  }
})

test('chat and mascot account for zoom offsets and short visual viewports', () => {
  const viewports = [
    { left: 70, top: 160, width: 390, height: 450 },
    { left: 110, top: 280, width: 220, height: 180 },
    { left: 15, top: 30, width: 70, height: 80 },
  ]
  for (const viewport of viewports) {
    const size = assistantSize(viewport)
    for (const ratio of [{ x: 0, y: 0 }, { x: 1, y: 1 }]) {
      const point = assistantPositionFromRatio(ratio, viewport, size)
      assert.ok(point.x >= viewport.left && point.y >= viewport.top)
      assert.ok(point.x + size.width <= viewport.left + viewport.width)
      assert.ok(point.y + size.height <= viewport.top + viewport.height)
      checkOverlay(viewport, ratio, false)
    }
  }
})
