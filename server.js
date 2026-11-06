import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { generateHash, generatePasswordHash, verifyPassword } from './src/main.js'

const assets = new Map([
  ['/', [new URL('./public/index.html', import.meta.url), 'text/html; charset=utf-8']],
  ['/app.js', [new URL('./public/app.js', import.meta.url), 'text/javascript; charset=utf-8']],
  ['/styles.css', [new URL('./public/styles.css', import.meta.url), 'text/css; charset=utf-8']],
  ['/favicon.svg', [new URL('./public/favicon.svg', import.meta.url), 'image/svg+xml']]
])

const operations = new Map([
  ['sha256', { fields: ['text'], run: ({ text }) => ({ hash: generateHash(text) }) }],
  ['derive', {
    fields: ['password', 'salt'],
    run: ({ password, salt }) => {
      const usedSalt = salt || randomBytes(16).toString('hex')
      return { hash: generatePasswordHash(password, usedSalt), salt: usedSalt }
    }
  }],
  ['verify', {
    fields: ['password', 'salt', 'hash'],
    run: ({ password, hash, salt }) => ({ matches: verifyPassword(password, hash, salt) })
  }]
])

function send(res, status, body, type, head = false) {
  if (res.destroyed || res.writableEnded) return
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(body),
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store'
  })
  res.end(head ? undefined : body)
}

function json(res, status, data) {
  send(res, status, JSON.stringify(data), 'application/json; charset=utf-8')
}

async function runOperation(req, res) {
  const limit = 4096
  if (Number(req.headers['content-length']) > limit) {
    req.resume()
    return json(res, 413, { error: 'The request is too large.' })
  }

  const chunks = []
  let size = 0
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length
    if (size > limit) {
      req.resume()
      return json(res, 413, { error: 'The request is too large.' })
    }
    chunks.push(chunk)
  }

  let data
  try {
    data = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return json(res, 400, { error: 'Invalid request.' })
  }

  const operation = operations.get(data?.operation)
  if (!operation || !operation.fields.every(field => typeof data[field] === 'string' && data[field].length <= 512)) {
    return json(res, 400, { error: 'Check the fields and try again.' })
  }

  json(res, 200, operation.run(data))
}

const server = createServer(async (req, res) => {
  try {
    const path = req.url.split('?')[0]
    if (req.method === 'POST' && path === '/api/crypto') {
      return await runOperation(req, res)
    }

    const asset = assets.get(path)
    if (asset && (req.method === 'GET' || req.method === 'HEAD')) {
      const [file, type] = asset
      const body = await readFile(file)
      return send(res, 200, body, type, req.method === 'HEAD')
    }

    send(res, 404, 'Not found', 'text/plain; charset=utf-8', req.method === 'HEAD')
  } catch {
    json(res, 500, { error: 'The operation could not be completed.' })
  }
})

const portArg = process.argv.indexOf('--port')
const port = portArg === -1 ? process.env.PORT ?? 3000 : process.argv[portArg + 1]
server.listen(Number(port), '0.0.0.0')
