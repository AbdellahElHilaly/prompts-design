import { mockDesigns } from '../data/mockDesigns'

// This is the only boundary the future FastAPI client needs to replace.
export async function listDesigns({ offset = 0, limit = 12 } = {}) {
  return {
    items: mockDesigns.slice(offset, offset + limit),
    total: mockDesigns.length,
  }
}
