export type HeroMediaImage = {
  id: number
  url: string
  width: number | null
  height: number | null
}

export type ImageDimensions = { width: number; height: number }

export const HERO_IMAGE_HEIGHT = 240
export const HERO_IMAGE_GAP = 12
export const HERO_PIXELS_PER_SECOND = 45

export function hasImageDimensions(image: { width: number | null; height: number | null }): image is ImageDimensions {
  return typeof image.width === 'number' && Number.isFinite(image.width) && image.width > 0
    && typeof image.height === 'number' && Number.isFinite(image.height) && image.height > 0
}

/** Scale uniformly to the row height; never crop or stretch the source image. */
export function heroImageWidth(image: { width: number | null; height: number | null }) {
  return hasImageDimensions(image) ? HERO_IMAGE_HEIGHT * image.width / image.height : 320
}

export function heroImageSize(image: { width: number | null; height: number | null }, maxWidth: number): ImageDimensions {
  const naturalWidth = heroImageWidth(image)
  const scale = maxWidth > 0 ? Math.min(1, maxWidth / naturalWidth) : 1
  return { width: naturalWidth * scale, height: HERO_IMAGE_HEIGHT * scale }
}

/** Nearby aspect ratios share a size group: narrow portraits through wide landscapes. */
export function heroSizeGroup(image: { width: number | null; height: number | null }) {
  return Math.round(heroImageWidth(image) / HERO_IMAGE_HEIGHT * 4)
}

/** Small to large, with a fresh shuffle inside each group of similar widths. */
export function shuffleHeroImages<T extends { id: number; width: number | null; height: number | null }>(
  images: readonly T[], previousOrder: readonly number[] = [], random = Math.random,
): T[] {
  const groups = new Map<number, T[]>()
  for (const image of images) {
    const group = heroSizeGroup(image)
    const members = groups.get(group) ?? []
    members.push(image)
    groups.set(group, members)
  }
  return [...groups.entries()].sort(([a], [b]) => a - b).flatMap(([, group]) => {
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[group[i], group[j]] = [group[j], group[i]]
    }
    const ids = new Set(group.map(image => image.id))
    const previousFirst = previousOrder.find(id => ids.has(id))
    if (group.length > 1 && group[0].id === previousFirst) {
      const j = 1 + Math.floor(random() * (group.length - 1))
      ;[group[0], group[j]] = [group[j], group[0]]
    }
    return group
  })
}
