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

const DEFAULT_VALUES = {
  name: '',
  tag: undefined,
  floorName: '',
}

const validatorFile = (file: File) => {
  return file.name.toLowerCase().endsWith('.glb') ||
    file.name.toLowerCase().endsWith('.usdz') ||
    file.type === 'model/gltf-binary' ||
    file.type === 'application/octet-stream' ||
    file.type === 'model/vnd.usdz+zip'
    ? null
    : { code: 'file-invalid-type', message: '' }
}

export { MAX_BYTES, threeModelAccept, isGlbFile, DEFAULT_VALUES, validatorFile }
