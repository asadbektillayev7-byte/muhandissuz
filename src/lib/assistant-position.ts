export type AssistantPoint = { x: number; y: number }
export type AssistantViewport = { left: number; top: number; width: number; height: number }
export type AssistantSize = { width: number; height: number }

export const ASSISTANT_POSITION_KEY = 'murvachcha:position:v1'
export const ASSISTANT_DRAG_THRESHOLD = 6
const MARGIN = 16
const NAV_RESERVE = 96
const GAP = 12

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

export function assistantSize(viewport: AssistantViewport): AssistantSize {
  const preferred = viewport.width < 640 ? { width: 88, height: 108 } : { width: 104, height: 128 }
  // Extremely small zoomed viewports should still contain the entire control.
  const scale = Math.min(1, Math.max(1, viewport.width - 2 * MARGIN) / preferred.width, Math.max(1, viewport.height - 2 * MARGIN) / preferred.height)
  return { width: preferred.width * scale, height: preferred.height * scale }
}

export function assistantBounds(viewport: AssistantViewport, size: AssistantSize) {
  const marginX = Math.min(MARGIN, Math.max(0, (viewport.width - size.width) / 2))
  const marginY = Math.min(MARGIN, Math.max(0, (viewport.height - size.height) / 2))
  const bottom = viewport.height >= size.height + NAV_RESERVE + marginY ? NAV_RESERVE : marginY
  return {
    minX: viewport.left + marginX,
    maxX: Math.max(viewport.left + marginX, viewport.left + viewport.width - size.width - marginX),
    minY: viewport.top + marginY,
    maxY: Math.max(viewport.top + marginY, viewport.top + viewport.height - size.height - bottom),
  }
}

export function clampAssistantPosition(point: AssistantPoint, viewport: AssistantViewport, size: AssistantSize): AssistantPoint {
  const bounds = assistantBounds(viewport, size)
  return { x: clamp(point.x, bounds.minX, bounds.maxX), y: clamp(point.y, bounds.minY, bounds.maxY) }
}

export function assistantPositionFromRatio(ratio: AssistantPoint, viewport: AssistantViewport, size: AssistantSize): AssistantPoint {
  const bounds = assistantBounds(viewport, size)
  return {
    x: bounds.minX + clamp(ratio.x, 0, 1) * (bounds.maxX - bounds.minX),
    y: bounds.minY + clamp(ratio.y, 0, 1) * (bounds.maxY - bounds.minY),
  }
}

export function assistantPositionToRatio(point: AssistantPoint, viewport: AssistantViewport, size: AssistantSize): AssistantPoint {
  const bounds = assistantBounds(viewport, size)
  const safe = clampAssistantPosition(point, viewport, size)
  return {
    x: bounds.maxX === bounds.minX ? 1 : (safe.x - bounds.minX) / (bounds.maxX - bounds.minX),
    y: bounds.maxY === bounds.minY ? 1 : (safe.y - bounds.minY) / (bounds.maxY - bounds.minY),
  }
}

export function assistantOverlayLayout(point: AssistantPoint, viewport: AssistantViewport, size: AssistantSize, requested: AssistantSize) {
  const marginX = Math.min(MARGIN, viewport.width / 4)
  const marginY = Math.min(MARGIN, viewport.height / 4)
  const bottomInset = viewport.height >= Math.min(requested.height, 280) + NAV_RESERVE + marginY ? NAV_RESERVE : marginY
  const left = viewport.left + marginX
  const right = viewport.left + viewport.width - marginX
  const top = viewport.top + marginY
  const bottom = viewport.top + viewport.height - bottomInset
  const width = Math.min(requested.width, Math.max(1, right - left))
  let height = Math.min(requested.height, Math.max(1, bottom - top))
  const side = point.x + size.width / 2 < viewport.left + viewport.width / 2 ? 'left' : 'right'
  const besideRight = point.x + size.width + GAP
  const besideLeft = point.x - GAP - width
  const fitsRight = besideRight + width <= right
  const fitsLeft = besideLeft >= left
  let x: number
  let y: number

  if ((side === 'left' && fitsRight) || (!fitsLeft && fitsRight)) {
    x = besideRight
    y = clamp(point.y + size.height - height, top, bottom - height)
  } else if (fitsLeft) {
    x = besideLeft
    y = clamp(point.y + size.height - height, top, bottom - height)
  } else {
    x = clamp(side === 'right' ? point.x + size.width - width : point.x, left, right - width)
    const above = Math.max(0, point.y - GAP - top)
    const below = Math.max(0, bottom - point.y - size.height - GAP)
    const available = Math.max(above, below)
    if (available >= Math.min(height, 200)) {
      height = Math.min(height, available)
      y = above >= below ? point.y - GAP - height : point.y + size.height + GAP
    } else {
      // A short keyboard/zoom viewport may not have a separate region. Keep
      // the dialog usable inside the visible viewport instead of clipping it.
      y = clamp(point.y + size.height - height, top, bottom - height)
    }
  }
  return { left: x, top: y, width, height, side }
}
