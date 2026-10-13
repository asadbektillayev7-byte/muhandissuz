import assert from 'node:assert/strict'
import test from 'node:test'
import { hackathonCard, projectCard, readArray } from '../src/lib/showcase'
import { getShowcaseLabels } from '../src/lib/showcase-i18n'

test('legacy hackathon video in cover remains playable without a broken image', () => {
  const item = hackathonCard({ id: 1, slug: 'past-event', status: 'past', title_uz: 'Hakaton', cover_image_url: 'https://drive.google.com/file/d/1aBcdEFghiJKlmNOP_123-xyz/view' }, 'en')
  assert.equal(item.title, 'Hakaton')
  assert.equal(item.status, 'past')
  assert.equal(item.posterUrl, null)
  assert.match(item.videoUrl!, /drive.google.com/)
})

test('malformed legacy JSON cannot crash the projects list', () => {
  assert.deepEqual(readArray('{broken'), [])
  assert.deepEqual(readArray('{}'), [])
  const item = projectCard({ id: 1, slug: 'project', title_en: 'Project', images: '{broken', student_names: '{broken' }, 'uz')
  assert.equal(item.title, 'Project')
  assert.equal(item.posterUrl, null)
})

test('project cover, old image cover and language fallbacks are preserved', () => {
  const row = { id: 1, slug: 'project', title_uz: 'Loyiha', images: '[{"url":"https://example.test/old.webp"}]', student_names: '["Ali"]', created_at: '2026-06-01T00:00:00Z' }
  assert.equal(projectCard(row, 'en').posterUrl, 'https://example.test/old.webp')
  assert.equal(projectCard({ ...row, cover_image_url: 'https://example.test/new.webp' }, 'uz').posterUrl, 'https://example.test/new.webp')
  assert.equal(projectCard(row, 'en').summary, 'Ali')
  assert.equal(projectCard(row, 'uz').date, row.created_at)
})

test('Uzbek empty state and query failure messages are distinct translations', () => {
  assert.equal(getShowcaseLabels('uz').emptyHackathons, "Hozircha hakatonlar yo'q.")
  assert.notEqual(getShowcaseLabels('uz').loadError, getShowcaseLabels('uz').emptyHackathons)
  assert.equal(getShowcaseLabels('en').emptyHackathons, 'No hackathons yet.')
})
