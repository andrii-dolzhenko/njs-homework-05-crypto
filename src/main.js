import { createHash, pbkdf2Sync, timingSafeEqual } from 'node:crypto'

/**
 * Calculates the SHA-256 digest of a UTF-8 string.
 * @param {string} input
 * @returns {string} The digest in hex.
 */
function generateHash(input) {
  return createHash('sha256').update(input).digest('hex')
}

function generatePasswordHash(password, salt, iterations = 10000, keylen = 64, digest = 'sha512') {
  return pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')
}

function verifyPassword(inputPassword, storedHash, salt, iterations = 10000, keylen = 64, digest = 'sha512') {
  if (
    typeof storedHash !== 'string' ||
    storedHash.length === 0 ||
    storedHash.length !== keylen * 2 ||
    /[^0-9a-f]/i.test(storedHash)
  ) {
    return false
  }

  const inputHash = pbkdf2Sync(inputPassword, salt, iterations, keylen, digest)
  return timingSafeEqual(inputHash, Buffer.from(storedHash, 'hex'))
}

export { generateHash, generatePasswordHash, verifyPassword }
