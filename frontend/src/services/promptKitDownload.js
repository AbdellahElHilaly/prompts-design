const encoder = new TextEncoder()

function createCrcTable() {
  return Array.from({ length: 256 }, (_, index) => {
    let value = index
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    return value >>> 0
  })
}

const crcTable = createCrcTable()

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function writeHeader(size) {
  const bytes = new Uint8Array(size)
  return { bytes, view: new DataView(bytes.buffer) }
}

function concat(chunks) {
  const result = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

function dosTimestamp(date = new Date()) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

function buildZip(files) {
  const localChunks = []
  const centralChunks = []
  const timestamp = dosTimestamp()
  let localOffset = 0

  for (const file of files) {
    const name = encoder.encode(file.path)
    const data = encoder.encode(file.content)
    const checksum = crc32(data)
    const local = writeHeader(30)

    local.view.setUint32(0, 0x04034b50, true)
    local.view.setUint16(4, 20, true)
    local.view.setUint16(6, 0x0800, true)
    local.view.setUint16(8, 0, true)
    local.view.setUint16(10, timestamp.time, true)
    local.view.setUint16(12, timestamp.date, true)
    local.view.setUint32(14, checksum, true)
    local.view.setUint32(18, data.length, true)
    local.view.setUint32(22, data.length, true)
    local.view.setUint16(26, name.length, true)
    localChunks.push(local.bytes, name, data)

    const central = writeHeader(46)
    central.view.setUint32(0, 0x02014b50, true)
    central.view.setUint16(4, 20, true)
    central.view.setUint16(6, 20, true)
    central.view.setUint16(8, 0x0800, true)
    central.view.setUint16(10, 0, true)
    central.view.setUint16(12, timestamp.time, true)
    central.view.setUint16(14, timestamp.date, true)
    central.view.setUint32(16, checksum, true)
    central.view.setUint32(20, data.length, true)
    central.view.setUint32(24, data.length, true)
    central.view.setUint16(28, name.length, true)
    central.view.setUint32(42, localOffset, true)
    centralChunks.push(central.bytes, name)

    localOffset += local.bytes.length + name.length + data.length
  }

  const localData = concat(localChunks)
  const centralData = concat(centralChunks)
  const end = writeHeader(22)
  end.view.setUint32(0, 0x06054b50, true)
  end.view.setUint16(8, files.length, true)
  end.view.setUint16(10, files.length, true)
  end.view.setUint32(12, centralData.length, true)
  end.view.setUint32(16, localData.length, true)

  return new Blob([localData, centralData, end.bytes], { type: 'application/zip' })
}

function safeName(value) {
  return value.trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ')
}

export function createPromptKitArchive(files, designTitle) {
  const folder = safeName(designTitle)
  return buildZip(files.map((file) => ({
    path: `${folder}/${file.name}`,
    content: file.content,
  })))
}

export function downloadPromptKit(files, designTitle, designId) {
  const archive = createPromptKitArchive(files, designTitle)
  const url = URL.createObjectURL(archive)
  const link = document.createElement('a')
  link.href = url
  link.download = `${designId}-prompt-kit.zip`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
