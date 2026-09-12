import { mockDesigns } from '../data/mockDesigns'
import {
  getAdminDesign,
  getAdminPromptContract,
  listAdminDesigns,
} from './adminDesignRepository'

const staticDataUrl = (resource) =>
  `${import.meta.env.BASE_URL}static-data/${resource}`

let promptKitsRequest

async function fetchJson(resource) {
  const response = await fetch(staticDataUrl(resource))
  if (!response.ok) throw new Error(`Static data returned ${response.status}`)
  return response.json()
}

async function getAllDesigns() {
  try {
    const designs = await listAdminDesigns()
    return designs
      .filter((design) => design.status === 'published')
      .map(({ id, title, description, approvalRate, preview }) => ({
        id,
        title,
        description,
        approvalRate,
        preview,
      }))
  } catch {
    return fetchJson('designs.json').catch(() => mockDesigns)
  }
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
  try {
    const design = await getAdminDesign(designId)
    if (design?.demo) return design.demo
  } catch {
    // Fall back to the bundled static JSON when local storage is unavailable.
  }
  const demos = await fetchJson('demos.json')
  const demo = demos[designId]
  if (!demo) throw new Error('Design demo not found')
  return demo
}

export async function getDesignPromptKit(designId) {
  if (!promptKitsRequest) {
    promptKitsRequest = fetchJson('prompt-kits.json')
  }

  const payload = await promptKitsRequest
  let constants = payload.files.constants.contentByDesign[designId]
  let manifesto = payload.files.manifesto

  try {
    const [design, contract] = await Promise.all([
      getAdminDesign(designId),
      getAdminPromptContract(),
    ])
    if (design?.constants) constants = design.constants
    if (contract?.userManifesto) manifesto = contract.userManifesto
  } catch {
    // Static prompt data remains a complete offline fallback.
  }

  if (!constants) throw new Error('Design prompt kit not found')

  return {
    schemaVersion: payload.schemaVersion,
    designId,
    files: {
      manifesto,
      constants: {
        filename: payload.files.constants.filename,
        content: constants,
      },
      userRequest: payload.files.userRequest,
    },
  }
}
