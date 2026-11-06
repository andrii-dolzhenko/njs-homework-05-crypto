# Node.js Homework 05 · Crypto

Three functions built with `node:crypto`: SHA-256 hashing, PBKDF2 password hashing, and password verification. The solution is in [src/main.js](src/main.js).

## Run the tests

Use Node.js 24 and Yarn Classic. With Corepack:

```sh
corepack yarn@1.22.22 install --frozen-lockfile
npm test
```

The test suite includes the original assignment tests and checks for default parameters, custom parameters, and malformed hashes.

## Demo

The GitHub Pages build uses Web Crypto in the browser. The local demo uses the Node.js functions from this assignment.

### Run locally

From the project folder, run:

```sh
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/).

1. Click **Hash text** to generate a SHA-256 digest.
2. Click **Derive hash** to generate a PBKDF2 hash. Leave the salt blank to generate one automatically. The hash and salt are copied to the verification form.
3. Click **Verify password**, then change the candidate password and try again to see a mismatch.

Use sample values only. The demo sends input to the Node.js server for processing.

## Example

Run this from the project folder:

```sh
node --input-type=module <<'JS'
import { randomBytes } from 'node:crypto'
import { generateHash, generatePasswordHash, verifyPassword } from './src/main.js'

console.log(generateHash('Hello, World!'))

const salt = randomBytes(16).toString('hex')
const hash = generatePasswordHash('example-password', salt)

console.log(verifyPassword('example-password', hash, salt)) // true
console.log(verifyPassword('wrong-password', hash, salt)) // false
JS
```

Both hashing functions return hex strings. PBKDF2 uses the assignment defaults: 10,000 iterations, a 64-byte key, and SHA-512. Use the same salt and parameters when verifying a password. These defaults are for the exercise.

© 2026 Andrii Dolzhenko. All Rights Reserved.
