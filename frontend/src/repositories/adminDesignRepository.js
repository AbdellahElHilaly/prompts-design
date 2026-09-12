const DESIGNS_KEY = 'prompt-designs'
const CONTRACT_KEY = 'prompt-design-contract'
const SESSION_KEY = 'prompt-design-session-expires-at'
const SESSION_DURATION_MS = 30 * 60 * 1000

const staticDataUrl = (resource) =>
  `${import.meta.env.BASE_URL}static-data/${resource}`

async function readStaticJson(resource) {
  const response = await fetch(staticDataUrl(resource))
  if (!response.ok) throw new Error(`Static data returned ${response.status}`)
  return response.json()
}

function ensureSession() {
  const expiresAt = Number(localStorage.getItem(SESSION_KEY))
  if (expiresAt > Date.now()) return expiresAt
  localStorage.removeItem(DESIGNS_KEY)
  localStorage.removeItem(CONTRACT_KEY)
  const nextExpiry = Date.now() + SESSION_DURATION_MS
  localStorage.setItem(SESSION_KEY, String(nextExpiry))
  return nextExpiry
}

function restartSession() {
  localStorage.removeItem(DESIGNS_KEY)
  localStorage.removeItem(CONTRACT_KEY)
  localStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_DURATION_MS))
}

function readLocal(key) {
  ensureSession()
  const value = localStorage.getItem(key)
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

function writeLocal(key, value) {
  ensureSession()
  localStorage.setItem(key, JSON.stringify(value))
}

export function getAdminSessionExpiresAt() {
  return ensureSession()
}

async function readSeedDesigns() {
  const [designs, demos, promptKits] = await Promise.all([
    readStaticJson('designs.json'),
    readStaticJson('demos.json'),
    readStaticJson('prompt-kits.json'),
  ])

  return designs.map((design, index) => ({
    ...design,
    status: 'published',
    demo: demos[design.id] ?? { title: design.title, html: '', css: '', js: '' },
    constants: promptKits.files.constants.contentByDesign[design.id] ?? {},
    sortOrder: index,
    updatedAt: new Date().toISOString(),
  }))
}

export async function listAdminDesigns() {
  const saved = readLocal(DESIGNS_KEY)
  const designs = Array.isArray(saved) ? saved : await readSeedDesigns()
  if (!saved) writeLocal(DESIGNS_KEY, designs)
  return structuredClone(designs).sort(
    (left, right) => (left.sortOrder ?? Number.MAX_SAFE_INTEGER) -
      (right.sortOrder ?? Number.MAX_SAFE_INTEGER),
  )
}

export async function getAdminDesign(designId) {
  return (await listAdminDesigns()).find((design) => design.id === designId) ?? null
}

export async function saveAdminDesign(design) {
  const designs = await listAdminDesigns()
  const savedDesign = { ...structuredClone(design), updatedAt: new Date().toISOString() }
  const index = designs.findIndex((item) => item.id === design.id)
  if (index === -1) designs.push(savedDesign)
  else designs[index] = savedDesign
  writeLocal(DESIGNS_KEY, designs)
}

export async function deleteAdminDesign(designId) {
  const designs = await listAdminDesigns()
  writeLocal(DESIGNS_KEY, designs.filter((design) => design.id !== designId))
}

export async function resetAdminDesigns() {
  restartSession()
  const designs = await readSeedDesigns()
  writeLocal(DESIGNS_KEY, designs)
  return designs
}

export async function getAdminPromptContract() {
  const saved = readLocal(CONTRACT_KEY)
  if (saved) return structuredClone(saved)
  const contract = await readStaticJson('admin-prompt-contract.json')
  writeLocal(CONTRACT_KEY, contract)
  return contract
}

export async function saveAdminPromptContract(contract) {
  writeLocal(CONTRACT_KEY, structuredClone(contract))
}
