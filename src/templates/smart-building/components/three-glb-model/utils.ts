import { Mesh, Object3D, Texture } from 'three'
import { Detected3DFormat } from './types'

const FORMAT_PROBE_BYTES = 12

const DEFAULT_MODEL_OPACITY = 0.35

export async function detect3DFormatFromUrl(
  url: string,
  signal?: AbortSignal
): Promise<Detected3DFormat> {
  const res = await fetch(url, {
    signal,
    cache: 'no-store',
    headers: { Range: `bytes=0-${FORMAT_PROBE_BYTES - 1}` },
  })
  if (!res.ok) {
    throw new Error(`Model probe failed: ${res.status} ${res.statusText}`)
  }
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf.slice(0, FORMAT_PROBE_BYTES))

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x67 && // g
    bytes[1] === 0x6c && // l
    bytes[2] === 0x54 && // T
    bytes[3] === 0x46 // F
  ) {
    return 'glb'
  }

  if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return 'usdz'
  }

  return 'unknown'
}

export function disposeThreeObject(root: Object3D) {
  root.traverse((obj) => {
    const anyObj = obj as any
    if (anyObj.geometry?.dispose) anyObj.geometry.dispose()

    const materials = anyObj.material
      ? Array.isArray(anyObj.material)
        ? anyObj.material
        : [anyObj.material]
      : []

    for (const mat of materials) {
      if (!mat) continue
      for (const key of Object.keys(mat)) {
        const value = mat[key]
        if (
          value &&
          (value as Texture).isTexture &&
          (value as Texture).dispose
        ) {
          ;(value as Texture).dispose()
        }
      }
      if (mat.dispose) mat.dispose()
    }
  })
}

export function updateModelOpacity(root: Object3D, activeMeshes: Object3D[]) {
  const activeSet = new Set<Object3D>(activeMeshes)

  root.updateMatrixWorld(true)

  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return

    const isOccupied = activeSet.has(obj)
    const opacity = isOccupied ? 1.0 : DEFAULT_MODEL_OPACITY

    const materials = Array.isArray(obj.material)
      ? obj.material
      : [obj.material]

    for (const mat of materials) {
      if (!mat) continue
      mat.transparent = opacity < 1
      mat.opacity = opacity
      if ('depthWrite' in mat) mat.depthWrite = !mat.transparent
      mat.needsUpdate = true
    }
  })
}
