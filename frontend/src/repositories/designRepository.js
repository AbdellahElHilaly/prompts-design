import { mockDesigns } from '../data/mockDesigns'

const mockApiUrl = (resource) =>
  `${import.meta.env.BASE_URL}mock-api/${resource}`

let designsRequest

async function fetchJson(resource) {
  const response = await fetch(mockApiUrl(resource))
  if (!response.ok) throw new Error(`Mock API returned ${response.status}`)
  return response.json()
}

async function getAllDesigns() {
  if (!designsRequest) {
    designsRequest = fetchJson('designs.json').catch(() => mockDesigns)
  }
  return designsRequest
}

// This repository is the only boundary the future FastAPI client needs to replace.
export async function listDesigns({ offset = 0, limit = 12 } = {}) {
  const designs = await getAllDesigns()
  return {
    items: designs.slice(offset, offset + limit),
    total: designs.length,
  }
}

export async function getDesignDemo(designId) {
  const demos = await fetchJson('demos.json')
  const demo = demos[designId]
  if (!demo) throw new Error('Design demo not found')
  return demo
}
