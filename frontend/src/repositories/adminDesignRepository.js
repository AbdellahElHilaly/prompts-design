const DB_NAME = 'prompt-design-admin'
const DB_VERSION = 1
const DESIGN_STORE = 'designs'
const SETTINGS_STORE = 'settings'
const SEEDED_KEY = 'seeded'
const CONTRACT_KEY = 'prompt-contract'

const mockApiUrl = (resource) =>
  `${import.meta.env.BASE_URL}mock-api/${resource}`

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(DESIGN_STORE)) {
        database.createObjectStore(DESIGN_STORE, { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function fetchJson(resource) {
  const response = await fetch(mockApiUrl(resource))
  if (!response.ok) throw new Error(`Mock API returned ${response.status}`)
  return response.json()
}

async function fetchSeedDesigns() {
  const [designs, demos, promptKits] = await Promise.all([
    fetchJson('designs.json'),
    fetchJson('demos.json'),
    fetchJson('prompt-kits.json'),
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

async function getSetting(key) {
  const database = await openDatabase()
  const transaction = database.transaction(SETTINGS_STORE, 'readonly')
  const result = await requestResult(transaction.objectStore(SETTINGS_STORE).get(key))
  database.close()
  return result?.value
}

async function seedDesigns(force = false) {
  if (!force && await getSetting(SEEDED_KEY)) return
  const designs = await fetchSeedDesigns()
  const database = await openDatabase()
  const transaction = database.transaction([DESIGN_STORE, SETTINGS_STORE], 'readwrite')
  const store = transaction.objectStore(DESIGN_STORE)
  if (force) store.clear()
  designs.forEach((design) => store.put(design))
  transaction.objectStore(SETTINGS_STORE).put({ key: SEEDED_KEY, value: true })
  await transactionDone(transaction)
  database.close()
}

export async function listAdminDesigns() {
  await seedDesigns()
  const database = await openDatabase()
  const transaction = database.transaction(DESIGN_STORE, 'readonly')
  const designs = await requestResult(transaction.objectStore(DESIGN_STORE).getAll())
  database.close()
  return designs.sort(
    (left, right) =>
      (left.sortOrder ?? Number.MAX_SAFE_INTEGER) -
      (right.sortOrder ?? Number.MAX_SAFE_INTEGER),
  )
}

export async function getAdminDesign(designId) {
  await seedDesigns()
  const database = await openDatabase()
  const transaction = database.transaction(DESIGN_STORE, 'readonly')
  const design = await requestResult(transaction.objectStore(DESIGN_STORE).get(designId))
  database.close()
  return design
}

export async function saveAdminDesign(design) {
  const database = await openDatabase()
  const transaction = database.transaction(DESIGN_STORE, 'readwrite')
  transaction.objectStore(DESIGN_STORE).put({
    ...structuredClone(design),
    updatedAt: new Date().toISOString(),
  })
  await transactionDone(transaction)
  database.close()
}

export async function deleteAdminDesign(designId) {
  const database = await openDatabase()
  const transaction = database.transaction(DESIGN_STORE, 'readwrite')
  transaction.objectStore(DESIGN_STORE).delete(designId)
  await transactionDone(transaction)
  database.close()
}

export async function resetAdminDesigns() {
  await seedDesigns(true)
  return listAdminDesigns()
}

export async function getAdminPromptContract() {
  const saved = await getSetting(CONTRACT_KEY)
  return saved ?? fetchJson('admin-prompt-contract.json')
}

export async function saveAdminPromptContract(contract) {
  const database = await openDatabase()
  const transaction = database.transaction(SETTINGS_STORE, 'readwrite')
  transaction.objectStore(SETTINGS_STORE).put({
    key: CONTRACT_KEY,
    value: structuredClone(contract),
  })
  await transactionDone(transaction)
  database.close()
}
