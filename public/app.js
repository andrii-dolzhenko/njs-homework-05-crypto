const byId = id => document.getElementById(id)

async function runOperation(data) {
  if (document.documentElement.dataset.cryptoRuntime === 'browser') {
    const { runBrowserCrypto } = await import('./browser-crypto.js')
    return runBrowserCrypto(data)
  }

  const response = await fetch('/api/crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error)
  return result
}

function connectForm(name, operation, onResult, reset) {
  const form = byId(`${name}-form`)
  const status = byId(`${name}-status`)
  const button = form.querySelector('button')

  form.addEventListener('submit', async event => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    button.disabled = true
    status.dataset.error = 'false'
    status.textContent = 'Working…'
    reset?.()

    try {
      const result = await runOperation({ ...data, operation })
      status.textContent = onResult(result)
    } catch {
      status.dataset.error = 'true'
      status.textContent = 'Could not complete the request. Please try again.'
    } finally {
      button.disabled = false
    }
  })
  form.inert = false
}

connectForm('sha', 'sha256', ({ hash }) => {
  byId('sha-result').value = hash
  return 'Digest ready.'
}, () => { byId('sha-result').value = '' })

connectForm('derive', 'derive', ({ hash, salt }) => {
  byId('derive-result').value = hash
  byId('verify-hash').value = hash
  byId('verify-salt').value = salt
  byId('verify-status').textContent = ''
  return 'Hash and salt copied to Check a match.'
}, () => { byId('derive-result').value = '' })

connectForm('verify', 'verify', ({ matches }) => matches ? 'Password matches.' : 'Password does not match.')
