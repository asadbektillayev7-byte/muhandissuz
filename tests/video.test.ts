import assert from 'node:assert/strict'
import test from 'node:test'
import { getVideoValidationError, parseVideoUrl } from '../src/lib/video'

const id = 'dQw4w9WgXcQ'
const drive = '1aBcdEFghiJKlmNOP_123-xyz'

test('YouTube watch, short, Shorts and embed links normalize to one safe player', () => {
  for (const link of [
    `https://www.youtube.com/watch?v=${id}&feature=shared`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=example`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
    `  https://youtu.be/${id}  `,
  ]) {
    assert.deepEqual(parseVideoUrl(link), {
      provider: 'youtube', id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      posterUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    })
  }
})

test('Drive view and open links normalize to preview without a thumbnail', () => {
  for (const link of [
    `https://drive.google.com/file/d/${drive}/view?usp=sharing`,
    `https://drive.google.com/open?id=${drive}&usp=sharing`,
    `https://drive.google.com/file/d/${drive}/preview`,
  ]) {
    assert.deepEqual(parseVideoUrl(link), {
      provider: 'drive', id: drive,
      embedUrl: `https://drive.google.com/file/d/${drive}/preview`,
      posterUrl: null,
    })
  }
})

test('Unsafe hosts, protocols, credentials, paths and malformed identifiers are rejected', () => {
  for (const link of [
    `http://www.youtube.com/watch?v=${id}`,
    `javascript:alert(1)`,
    `https://youtube.com.evil.test/watch?v=${id}`,
    `https://evil.test/?url=https://youtu.be/${id}`,
    `https://user:password@youtube.com/watch?v=${id}`,
    `https://www.youtube.com:8443/watch?v=${id}`,
    `https://youtube.com/watch?v=short`,
    `https://youtu.be/${id}/extra`,
    `https://youtube.com/playlist?list=${id}`,
    `https://drive.google.com.evil.test/file/d/${drive}/view`,
    `https://drive.google.com/drive/folders/${drive}`,
    `https://drive.google.com/open?id=../bad`,
    `https://vimeo.com/123456`,
    'not a url',
    '',
  ]) assert.equal(parseVideoUrl(link), null, link)
  assert.equal(parseVideoUrl(null), null)
  assert.equal(parseVideoUrl(undefined), null)
})

test('Admin validation allows optional videos and YouTube thumbnails but requires Drive cover', () => {
  assert.equal(getVideoValidationError(null), null)
  assert.equal(getVideoValidationError('   '), null)
  assert.equal(getVideoValidationError(`https://youtu.be/${id}`), null)
  assert.match(getVideoValidationError('https://vimeo.com/123')!, /YouTube/)
  assert.match(getVideoValidationError(`https://drive.google.com/open?id=${drive}`)!, /muqova/)
  assert.equal(getVideoValidationError(`https://drive.google.com/open?id=${drive}`, 'https://example.test/cover.webp'), null)
})
