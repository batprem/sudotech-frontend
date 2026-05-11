import { request } from './client.js'

export const createColumn = (boardId, title)            => request(`/api/boards/${boardId}/columns`, { method: 'POST', body: { title } })
export const updateColumn = (id, patch)                 => request(`/api/columns/${id}`, { method: 'PUT', body: patch })
export const moveColumn   = (id, position)              => request(`/api/columns/${id}/move`, { method: 'PATCH', body: { position } })
export const deleteColumn = (id)                        => request(`/api/columns/${id}`, { method: 'DELETE' })
