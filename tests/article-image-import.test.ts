import assert from 'node:assert/strict'
import test from 'node:test'
import sharp from 'sharp'
import {
  detectRasterMime, downloadRemoteRaster, ImageImportError, isPublicImageAddress,
  MAX_REMOTE_IMAGE_BYTES, optimizeImportedRaster, parseRemoteImageUrl, pinnedImageRequestOptions,
  type ImageResponse,
} from '../src/lib/article-image-import'

const publicDns = async () => [{ address: '93.184.216.34', family: 4 }]
const png = Buffer.from('89504e470d0a1a0a', 'hex')
function response(status = 200, headers: ImageResponse['headers'] = { 'content-type': 'image/png' }, chunks = [png]): ImageResponse {
  return { status, headers, body: (async function* () { for (const chunk of chunks) yield chunk })(), cancel() {} }
}

test('image import rejects private/reserved IPv4, mapped IPv6 and tunnelling networks', () => {
  const blocked = [
    '0.0.0.0', '10.0.0.1', '100.64.0.1', '100.127.255.255', '127.0.0.1', '169.254.169.254', '168.63.129.16',
    '172.16.0.1', '172.31.255.255', '192.168.1.1', '192.0.0.1', '192.0.2.1', '192.88.99.1',
    '198.18.0.1', '198.19.1.1', '198.51.100.1', '203.0.113.1', '224.0.0.1', '240.0.0.1', '255.255.255.255',
    '::', '::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:8.8.8.8', '64:ff9b::7f00:1',
    'fc00::1', 'fd12::1', 'fe80::1', 'fe80::1%en0', 'ff02::1', '2001::1', '2001:db8::1', '2002:7f00:1::',
    '3fff::1', '2620:4f:8000::1', '2001:4860::5efe:7f00:1', 'garbage',
  ]
  for (const value of blocked) assert.equal(isPublicImageAddress(value), false, value)
  for (const value of ['8.8.8.8', '93.184.216.34', '100.128.0.1', '172.32.0.1', '2001:4860:4860::8888', '2606:4700:4700::1111']) {
    assert.equal(isPublicImageAddress(value), true, value)
  }
})

test('image URL parser blocks encoded loopback tricks, credentials, insecure URLs and custom ports', () => {
  for (const url of ['http://example.com/a.png', 'https://user:secret@example.com/a.png', 'https://example.com:444/a.png',
    'https://127.1/a.png', 'https://2130706433/a.png', 'https://0x7f000001/a.png', 'https://0177.0.0.1/a.png',
    'https://[::ffff:127.0.0.1]/a.png', 'https://localhost/a.png', 'https://a.internal/a.png', 'data:image/png;base64,eA==']) {
    assert.throws(() => parseRemoteImageUrl(url), ImageImportError, url)
  }
  assert.equal(parseRemoteImageUrl('https://images.example.com/a.png?q=1#ignore').href, 'https://images.example.com/a.png?q=1')
})

test('image request pins checked DNS address and sends no browser credentials', async () => {
  const address = { address: '93.184.216.34', family: 4 }
  const options = pinnedImageRequestOptions(address, new AbortController().signal)
  assert.equal(options.agent, false)
  assert.equal(options.method, 'GET')
  assert.equal(options.headers && 'authorization' in options.headers, false)
  assert.equal(options.headers && 'cookie' in options.headers, false)
  options.lookup!('changed-to-localhost.example', {}, (error, value, family) => {
    assert.equal(error, null); assert.equal(value, address.address); assert.equal(family, 4)
  })
  options.lookup!('changed-to-localhost.example', { all: true }, (error, value) => {
    assert.equal(error, null); assert.deepEqual(value, [address])
  })
})

test('image import rejects mixed public/private DNS without contacting the host', async () => {
  let requested = false
  await assert.rejects(downloadRemoteRaster('https://images.example.com/a.png', {
    resolve: async () => [...await publicDns(), { address: '10.0.0.2', family: 4 }],
    request: async () => { requested = true; return response() },
  }), /not allowed/)
  assert.equal(requested, false)
})

test('image import validates every redirect and resolves/pins the new destination', async () => {
  const resolutions: string[] = []
  const requested: string[] = []
  const bytes = await downloadRemoteRaster('https://images.example.com/a.png', {
    resolve: async (hostname) => { resolutions.push(hostname); return publicDns() },
    request: async (url, address) => {
      assert.equal(address.address, '93.184.216.34')
      requested.push(url.hostname)
      return requested.length === 1 ? response(302, { location: 'https://cdn.example.com/b.png' }) : response()
    },
  })
  assert.deepEqual(resolutions, ['images.example.com', 'cdn.example.com'])
  assert.deepEqual(requested, resolutions)
  assert.deepEqual(bytes, png)
  for (const location of ['https://169.254.169.254/latest', 'http://cdn.example.com/a.png', 'https://private.example.com/a.png']) {
    let count = 0
    await assert.rejects(downloadRemoteRaster('https://images.example.com/a.png', {
      resolve: async (hostname) => hostname === 'private.example.com' ? [{ address: '192.168.0.2', family: 4 }] : publicDns(),
      request: async () => { count++; return response(302, { location }) },
    }), ImageImportError)
    assert.equal(count, 1)
  }
})

test('image import limits redirects and cancels every response', async () => {
  let cancelled = 0
  await assert.rejects(downloadRemoteRaster('https://images.example.com/a.png', {
    resolve: publicDns,
    request: async () => ({ ...response(302, { location: '/a.png' }), cancel: () => { cancelled++ } }),
  }), /redirects/)
  assert.equal(cancelled, 4)
})

test('image import rejects size overflow both with and without Content-Length', async () => {
  for (const result of [
    response(200, { 'content-type': 'image/png', 'content-length': String(MAX_REMOTE_IMAGE_BYTES + 1) }),
    response(200, { 'content-type': 'image/png' }, [png, Buffer.alloc(MAX_REMOTE_IMAGE_BYTES)]),
  ]) {
    let cancelled = false
    result.cancel = () => { cancelled = true }
    await assert.rejects(downloadRemoteRaster('https://images.example.com/a.png', {
      resolve: publicDns, request: async () => result,
    }), (error: unknown) => error instanceof ImageImportError && error.status === 413)
    assert.equal(cancelled, true)
  }
})

test('image import rejects HTML, SVG, mismatched MIME, compression and inaccessible source', async () => {
  for (const result of [
    response(200, { 'content-type': 'text/html' }, [Buffer.from('<html>Sign in</html>')]),
    response(200, { 'content-type': 'image/svg+xml' }, [Buffer.from('<svg/>')]),
    response(200, { 'content-type': 'image/png' }, [Buffer.from('<script>not an image</script>')]),
    response(200, { 'content-type': 'image/jpeg' }, [png]),
    response(200, { 'content-type': 'image/png', 'content-encoding': 'gzip' }),
    response(403),
  ]) {
    await assert.rejects(downloadRemoteRaster('https://images.example.com/a.png', {
      resolve: publicDns, request: async () => result,
    }), ImageImportError)
  }
})

test('image import has a total deadline even when DNS or a body stalls', async () => {
  await assert.rejects(downloadRemoteRaster('https://images.example.com/a.png', {
    timeoutMs: 15, resolve: () => new Promise(() => {}),
  }), /timed out/)
  let cancelled = false
  await assert.rejects(downloadRemoteRaster('https://images.example.com/a.png', {
    timeoutMs: 15, resolve: publicDns,
    request: async () => ({ ...response(), cancel: () => { cancelled = true }, body: { [Symbol.asyncIterator]: () => ({ next: () => new Promise(() => {}) }) } }),
  }), /timed out/)
  assert.equal(cancelled, true)
})

test('image decoder rejects corrupt raster, compresses valid images and keeps aspect ratio', async () => {
  await assert.rejects(optimizeImportedRaster(png), /damaged/)
  const original = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: '#149ca1' } }).png().toBuffer()
  const optimized = await optimizeImportedRaster(original)
  assert.equal(detectRasterMime(optimized), 'image/webp')
  const metadata = await sharp(optimized).metadata()
  assert.equal(metadata.width, 1600)
  assert.equal(metadata.height, 800)
  assert.ok(optimized.length < 3 * 1024 * 1024)
})
