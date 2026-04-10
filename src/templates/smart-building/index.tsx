'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ImportGlb } from './components/import-glb'
import GlbModel, { GlbModelFallback } from './components/three-glb-model'

export default function SmartBuilding() {
  const [modelUrl, setModelUrl] = useState<string>()
  const blobUrlRef = useRef<string | null>(null)

  const handleImport = useCallback((objectUrl: string) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
    }
    blobUrlRef.current = objectUrl
    setModelUrl(objectUrl)
  }, [])

  const handleReset = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setModelUrl(undefined)
  }, [])

  useEffect(
    () => () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
    },
    []
  )

  return (
    <div className="relative h-full min-h-[480px] w-full">
      <ImportGlb
        className="absolute left-4 top-4 z-10"
        onImport={handleImport}
        onReset={handleReset}
        showReset={!!modelUrl}
      />
      <Canvas
        className="h-full w-full"
        camera={{ position: [3, 2, 6], fov: 45 }}
        dpr={[1, 2]}
        frameloop="always"
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
          depth: true,
          stencil: false,
        }}
        shadows
      >
        <color attach="background" args={['#0b1020']} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
        />
        {modelUrl ? (
          <Suspense key={modelUrl} fallback={<GlbModelFallback />}>
            <GlbModel url={modelUrl} position={[0, -1, 0]} />
          </Suspense>
        ) : null}
      </Canvas>
    </div>
  )
}
