import { request } from './client.js'

export const listBoards  = ()          => request('/api/boards')
export const getBoard    = (id)        => request(`/api/boards/${id}`)
export const createBoard = (title)     => request('/api/boards', { method: 'POST', body: { title } })
export const updateBoard = (id, patch) => request(`/api/boards/${id}`, { method: 'PUT', body: patch })
export const deleteBoard = (id)        => request(`/api/boards/${id}`, { method: 'DELETE' })
