import assert from 'node:assert/strict'
import test from 'node:test'
import {
  HERO_IMAGE_HEIGHT,
  hasImageDimensions,
  heroImageSize,
  heroImageWidth,
  heroSizeGroup,
  shuffleHeroImages,
} from '../src/lib/hero-media'

const image = (id: number, width: number | null, height: number | null) => ({
  id, url: `https://example.test/${id}.jpg`, width, height,
})

test('hero images preserve portrait, landscape, and widescreen proportions at the row height', () => {
  for (const [width, height] of [[4, 3], [9, 16], [16, 9]]) {
    const original = image(1, width, height)
    assert.equal(hasImageDimensions(original), true)
    assert.ok(Math.abs(heroImageWidth(original) / HERO_IMAGE_HEIGHT - width / height) < 1e-10)
  }
  assert.equal(heroImageWidth(image(1, 9, 16)), 135)
  assert.equal(heroImageWidth(image(1, 4, 3)), 320)
  assert.equal(heroSizeGroup(image(1, 9, 16)), 2)
  assert.equal(heroSizeGroup(image(1, 4, 3)), 5)
  assert.equal(heroSizeGroup(image(1, 16, 9)), 7)
})

test('missing, zero, negative, and non-finite dimensions use a safe placeholder width', () => {
  for (const invalid of [null, 0, -1, NaN, Infinity, -Infinity]) {
    for (const original of [image(1, invalid, 100), image(1, 100, invalid)]) {
      assert.equal(hasImageDimensions(original), false)
      assert.equal(heroImageWidth(original), 320)
      assert.equal(heroSizeGroup(original), 5)
    }
  }
})

test('mobile sizing fits portrait, widescreen, and panoramic photos without changing their proportions', () => {
  for (const maxWidth of [375, 343]) {
    for (const [width, height] of [[9, 16], [4, 3], [16, 9], [4, 1]]) {
      const original = image(1, width, height)
      const size = heroImageSize(original, maxWidth)
      assert.ok(size.width > 0 && size.width <= maxWidth)
      assert.ok(size.height > 0 && size.height <= HERO_IMAGE_HEIGHT)
      assert.ok(Math.abs(size.width / size.height - width / height) < 1e-10)
      if (heroImageWidth(original) <= maxWidth) {
        assert.equal(size.height, HERO_IMAGE_HEIGHT, 'narrow photos keep the full row height')
      } else {
        assert.ok(Math.abs(size.width - maxWidth) < 1e-10, 'wide photos shrink uniformly to the column width')
      }
    }
  }
})

test('shuffling sorts narrow-to-wide groups without mutating, losing, or duplicating images', () => {
  const originals = Object.freeze([
    Object.freeze(image(1, 16, 9)),
    Object.freeze(image(2, 9, 16)),
    Object.freeze(image(3, 4, 3)),
    Object.freeze(image(4, 131, 100)),
    Object.freeze(image(5, 10, 16)),
    Object.freeze(image(6, 177, 100)),
  ])
  const priorIds = originals.map(item => item.id)
  const result = shuffleHeroImages(originals, [], () => 0)
  const groups = result.map(heroSizeGroup)
  assert.deepEqual(groups, [...groups].sort((a, b) => a - b))
  assert.equal(heroSizeGroup(originals[2]), heroSizeGroup(originals[3]), 'nearby ratios share a shuffle group')
  assert.deepEqual(result.map(item => item.id).sort((a, b) => a - b), [...priorIds].sort((a, b) => a - b))
  assert.equal(new Set(result.map(item => item.id)).size, originals.length)
  assert.deepEqual(originals.map(item => item.id), priorIds)
  assert.notEqual(result, originals)
  for (const item of result) assert.equal(item, originals.find(original => original.id === item.id))
})

test('each multi-image group starts differently on consecutive visits even when randomness repeats', () => {
  const originals = [
    image(1, 9, 16), image(2, 9, 16),
    image(3, 4, 3), image(4, 4, 3), image(5, 4, 3),
    image(6, 16, 9), image(7, 16, 9),
  ]
  const groupLeaders = (items: typeof originals) => {
    const leaders = new Map<number, number>()
    for (const item of items) if (!leaders.has(heroSizeGroup(item))) leaders.set(heroSizeGroup(item), item.id)
    return leaders
  }
  let previous = originals
  for (let visit = 0; visit < 3; visit++) {
    const previousOrder = Object.freeze(previous.map(item => item.id))
    // This RNG leaves Fisher–Yates in the same order; the prior-visit guard
    // must still visibly change the start of every group that has a choice.
    const next = shuffleHeroImages(originals, previousOrder, () => 0.999)
    const previousLeaders = groupLeaders(previous)
    for (const [group, id] of groupLeaders(next)) assert.notEqual(id, previousLeaders.get(group))
    previous = next
  }
})

test('empty and single-image collections are safe, including obsolete prior IDs', () => {
  const noRandomness = () => { throw new Error('No shuffle is needed') }
  assert.deepEqual(shuffleHeroImages([], [99], noRandomness), [])
  const only = image(1, 9, 16)
  assert.deepEqual(shuffleHeroImages([only], [1, 99], noRandomness), [only])
  const differentSizes = [image(2, 16, 9), only]
  assert.deepEqual(shuffleHeroImages(differentSizes, [99], noRandomness), [only, differentSizes[0]])
})
