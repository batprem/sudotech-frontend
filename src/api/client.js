import { auth } from '../auth/store.js'

export async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth.state.token) headers['Authorization'] = `Bearer ${auth.state.token}`

  const res = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  })

  if (res.status === 401) {
    auth.logout()
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `request failed: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}
