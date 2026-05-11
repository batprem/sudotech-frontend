import { request } from './client.js'

export function register(username, password) {
  return request('/api/auth/register', {
    method: 'POST',
    body: { username, password }
  })
}

export function login(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: { username, password }
  })
}

export function me() {
  return request('/api/auth/me')
}
