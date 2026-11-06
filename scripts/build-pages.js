import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

const source = new URL('../public/', import.meta.url)
const target = new URL('../dist/', import.meta.url)
const original = await readFile(new URL('index.html', source), 'utf8')
const localNotice = 'Use sample values only. The demo sends input to the server to compute the result.'

if (!original.includes('<html lang="en">') || !original.includes(localNotice)) {
  throw new Error('The demo HTML no longer matches the Pages template.')
}

const html = original
  .replace('<html lang="en">', '<html lang="en" data-crypto-runtime="browser">')
  .replace(localNotice, 'This demo uses Web Crypto. Sample inputs stay in your browser.')
  .replaceAll(' method="post" action="/api/crypto"', ' inert')

await mkdir(target, { recursive: true })
await Promise.all([
  writeFile(new URL('index.html', target), html),
  ...['app.js', 'styles.css', 'favicon.svg'].map(file => copyFile(new URL(file, source), new URL(file, target))),
  copyFile(new URL('./browser-crypto.js', import.meta.url), new URL('browser-crypto.js', target))
])
