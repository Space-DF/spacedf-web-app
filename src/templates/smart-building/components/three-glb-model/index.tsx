'use client'

import { Html, OrbitControls, useGLTF } from '@react-three/drei'
import { useThree, type ThreeElements } from '@react-three/fiber'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import type { Object3D, Texture } from 'three'

type GlbModelProps = ThreeElements['group'] & {
  url: string
}

function disposeObject(root: Object3D) {
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

function GlbScene({
  url,
  ...props
}: Required<Pick<GlbModelProps, 'url'>> & ThreeElements['group']) {
  const { scene } = useGLTF(url)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    return () => {
      disposeObject(scene)
      useGLTF.clear(url)
      invalidate()
    }
  }, [scene, url, invalidate])

  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  )
}

export default function GlbModel({ url, ...props }: GlbModelProps) {
  const invalidate = useThree((s) => s.invalidate)
  return (
    <>
      <GlbScene url={url} {...props} />
      <OrbitControls makeDefault enableDamping onChange={() => invalidate()} />
    </>
  )
}

export function GlbModelFallback() {
  const t = useTranslations('smartBuilding')
  return (
    <Html center style={{ fontSize: 14, opacity: 0.8 }}>
      {t('loading_model')}
    </Html>
  )
}
