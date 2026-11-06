const encoder = new TextEncoder()
const iterations = 10000
const keyLength = 64

function toHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function deriveHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    hash: 'SHA-512',
    salt: encoder.encode(salt),
    iterations
  }, key, keyLength * 8)

  return toHex(new Uint8Array(hash))
}

export async function runBrowserCrypto({ operation, text, password, salt, hash }) {
  switch (operation) {
    case 'sha256': {
      const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text))
      return { hash: toHex(new Uint8Array(digest)) }
    }
    case 'derive': {
      const usedSalt = salt || toHex(crypto.getRandomValues(new Uint8Array(16)))
      return { hash: await deriveHash(password, usedSalt), salt: usedSalt }
    }
    case 'verify': {
      if (hash.length !== keyLength * 2 || /[^0-9a-f]/i.test(hash)) {
        return { matches: false }
      }
      return { matches: await deriveHash(password, salt) === hash.toLowerCase() }
    }
    default:
      throw new Error('Unsupported operation')
  }
}
