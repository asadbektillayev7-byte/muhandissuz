import assert from 'node:assert/strict'
import test from 'node:test'
import { dateInputToISOString, dateInputValue, formatShowcaseDate } from '../src/lib/showcase-date'

test('Uzbek and English dates use deterministic month names', () => {
  assert.equal(formatShowcaseDate('2026-06-01T00:00:00.000Z', 'uz'), '1 iyun 2026')
  assert.equal(formatShowcaseDate('2026-06-01', 'en'), '1 Jun 2026')
  assert.equal(formatShowcaseDate('2026-06-01T00:00:00+00:00', 'en'), '1 Jun 2026')
})

test('Tashkent date follows its fixed UTC+5 offset across midnight and year boundaries', () => {
  assert.equal(formatShowcaseDate('2026-12-31T19:00:00Z', 'uz'), '1 yanvar 2027')
  assert.equal(formatShowcaseDate('2026-06-01T18:59:59Z', 'uz'), '1 iyun 2026')
  assert.equal(formatShowcaseDate('2026-06-01T19:00:00Z', 'uz'), '2 iyun 2026')
  assert.equal(formatShowcaseDate('2026-06-02T00:00:00+05:00', 'en'), '2 Jun 2026')
})

test('Timezone-less ISO timestamps render consistently regardless of the host timezone', () => {
  const original = process.env.TZ
  try {
    for (const timezone of ['UTC', 'Asia/Tashkent', 'America/Los_Angeles']) {
      process.env.TZ = timezone
      assert.equal(formatShowcaseDate('2026-06-01T19:00:00', 'uz'), '2 iyun 2026')
      assert.equal(formatShowcaseDate('2026-06-01', 'uz'), '1 iyun 2026')
    }
  } finally {
    if (original === undefined) delete process.env.TZ
    else process.env.TZ = original
  }
})

test('Missing and malformed dates do not crash cards', () => {
  assert.equal(formatShowcaseDate(null, 'uz'), '')
  assert.equal(formatShowcaseDate(undefined, 'uz'), '')
  assert.equal(formatShowcaseDate('not a date', 'uz'), '')
  assert.equal(formatShowcaseDate('2026-99-99', 'uz'), '')
})

test('Admin date inputs preserve Tashkent calendar days for stored timestamps', () => {
  assert.equal(dateInputValue('2026-05-31T19:00:00Z'), '2026-06-01')
  assert.equal(dateInputValue('2026-06-01T00:00:00+05:00'), '2026-06-01')
  assert.equal(dateInputValue('2026-12-31T19:00:00Z'), '2027-01-01')
  assert.equal(dateInputValue('2026-06-01'), '2026-06-01')
  assert.equal(dateInputValue('2026-05-31T19:00:00'), '2026-06-01')
})

test('Admin date save and reload round trips independently of server or browser timezone', () => {
  const original = process.env.TZ
  try {
    for (const timezone of ['UTC', 'Asia/Tashkent', 'America/Los_Angeles', 'Pacific/Auckland']) {
      process.env.TZ = timezone
      assert.equal(dateInputToISOString('2026-06-01'), '2026-05-31T19:00:00.000Z')
      assert.equal(dateInputValue(dateInputToISOString('2026-06-01')), '2026-06-01')
      assert.equal(formatShowcaseDate(dateInputToISOString('2026-06-01'), 'uz'), '1 iyun 2026')
      assert.equal(dateInputValue(dateInputToISOString('2027-01-01')), '2027-01-01')
    }
  } finally {
    if (original === undefined) delete process.env.TZ
    else process.env.TZ = original
  }
})

test('Admin date helpers reject invalid dates and permit empty optional dates', () => {
  for (const value of ['', 'not a date', '2026-99-99', '2026-02-30', '2026-06-01T00:00:00Z']) {
    assert.equal(dateInputToISOString(value), null)
  }
  for (const value of [null, undefined, '', 'not a date', '2026-99-99', '2026-02-30']) {
    assert.equal(dateInputValue(value), '')
  }
})
