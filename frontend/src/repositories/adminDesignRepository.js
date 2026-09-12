const DESIGNS_KEY = 'prompt-designs'
const CONTRACT_KEY = 'prompt-design-contract'

const staticDataUrl = (resource) =>
  `${import.meta.env.BASE_URL}static-data/${resource}`

async function readStaticJson(resource) {
  const response = await fetch(staticDataUrl(resource))
  if (!response.ok) throw new Error(`Static data returned ${response.status}`)
  return response.json()
}

function readLocal(key) {
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
  localStorage.setItem(key, JSON.stringify(value))
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
