import { request } from './client.js'

export const listLabels   = (boardId)        => request(`/api/boards/${boardId}/labels`)
export const createLabel  = (boardId, body)  => request(`/api/boards/${boardId}/labels`, { method: 'POST', body })
export const updateLabel  = (id, body)       => request(`/api/labels/${id}`, { method: 'PUT', body })
export const deleteLabel  = (id)             => request(`/api/labels/${id}`, { method: 'DELETE' })
