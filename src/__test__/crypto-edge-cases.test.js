import { expect, test } from 'vitest'
import { generatePasswordHash, verifyPassword } from '../main.js'

test('uses the specified PBKDF2 defaults with a Unicode password', () => {
  const expected =
    '679c1f18c958b3c80688e575602ae6f877cc861da10b385ad8932431530c1f71773' +
    'bb8ce9b003f0b26ebd8fc4207f66c901317b80b81362c7ca4185b6969b5c9'

  expect(generatePasswordHash('пароль', 'example-salt')).toBe(expected)
  expect(verifyPassword('пароль', expected, 'example-salt')).toBe(true)
})

test('uses custom PBKDF2 parameters for hashing and verification', () => {
  const expected = 'ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43'

  expect(generatePasswordHash('password', 'salt', 2, 32, 'sha256')).toBe(expected)
  expect(verifyPassword('password', expected.toUpperCase(), 'salt', 2, 32, 'sha256')).toBe(true)
  expect(verifyPassword('password', expected, 'salt', 3, 32, 'sha256')).toBe(false)
})

test('rejects malformed stored hashes before decoding them', () => {
  const hash = generatePasswordHash('password', 'salt')

  for (const value of [hash + 'xyz', hash + 'a', hash.slice(2), hash.slice(0, -1) + 'z', '', null]) {
    expect(verifyPassword('password', value, 'salt')).toBe(false)
  }
})
