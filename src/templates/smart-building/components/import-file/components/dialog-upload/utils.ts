const MAX_BYTES = 100 * 1024 * 1024

const threeModelAccept = {
  'model/gltf-binary': ['.glb'],
  'application/octet-stream': ['.glb'],
  '.usdz': ['.usdz'],
  'model/vnd.usdz+zip': ['.usdz'],
} as const

function isGlbFile(file: File) {
  return (
    file.name.toLowerCase().endsWith('.glb') ||
    file.type === 'model/gltf-binary' ||
    file.type === 'application/octet-stream' ||
    file.name.toLowerCase().endsWith('.usdz') ||
    file.type === 'model/vnd.usdz+zip'
  )
}

export { MAX_BYTES, threeModelAccept, isGlbFile }
