import { request } from './client.js'

export const createCard = (columnId, body) => request(`/api/columns/${columnId}/cards`, { method: 'POST', body })
export const getCard    = (id)             => request(`/api/cards/${id}`)
export const updateCard = (id, body)       => request(`/api/cards/${id}`, { method: 'PUT', body })
export const moveCard   = (id, columnId, position) =>
  request(`/api/cards/${id}/move`, { method: 'PATCH', body: { column_id: columnId, position } })
export const deleteCard = (id)             => request(`/api/cards/${id}`, { method: 'DELETE' })
