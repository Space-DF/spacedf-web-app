'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef } from 'react'
import { ImportThreeModel } from './components/import-file'
import ThreeModel, { ModelFallback } from './components/three-glb-model'
import { useModelGLB } from '@/stores/template/model-glb'
import { useShallow } from 'zustand/react/shallow'
import { useShowDummyData } from '@/hooks/useShowDummyData'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import SpacedfLogo from '@/components/common/spacedf-logo'
import { ThreeModelControls } from './components/three-model-controls'
import { useGlobalStore } from '@/stores'
import { useUploadModel } from './components/import-file/hooks/useUploadGlb'

export default function SmartBuilding() {
  const { setModelGLBUrl, modelGLBUrl, setDefaultModel, resetModel } =
    useModelGLB(
      useShallow((state) => ({
        setModelGLBUrl: state.setModelGLBUrl,
        modelGLBUrl: state.modelGLBUrl,
        setDefaultModel: state.setDefaultModel,
        resetModel: state.resetModel,
      }))
    )
  const blobUrlRef = useRef<string | null>(null)
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const buildArtifact = currentSpace?.url_build_artifact

  const handleImport = useCallback((objectUrl: string) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
    }
    blobUrlRef.current = objectUrl
    setModelGLBUrl(objectUrl)
  }, [])

  useEffect(
    () => () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
    },
    []
  )

  const {
    uploadModel,
    isUploading,
    progress: uploadProgress,
  } = useUploadModel()

  useEffect(() => {
    if (buildArtifact) {
      setModelGLBUrl(buildArtifact)
      return
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setModelGLBUrl(undefined)
  }, [buildArtifact, setModelGLBUrl])

  const showDummyData = useShowDummyData()
  const isAuthenticated = useAuthenticated()

  useEffect(() => {
    if (!isAuthenticated) {
      resetModel()
    }
    if (!showDummyData) return
    setDefaultModel()
  }, [showDummyData])

  return (
    <>
      <ImportThreeModel
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        onImport={handleImport}
        isHidden={
          (!!modelGLBUrl && !isUploading) || (!currentSpace && isAuthenticated)
        }
        isUploading={isUploading}
        progress={uploadProgress}
        uploadModel={uploadModel}
      />
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex p-3 justify-between">
          <div className="w-fit">
            <SpacedfLogo />
          </div>
          <div className="flex space-x-3">
            {/* <DropdownSwitchFloor /> */}
            {modelGLBUrl ? <ThreeModelControls /> : <></>}
          </div>
        </div>
      </div>
      <div className="relative h-full bg-brand-component-fill-dark w-full">
        {modelGLBUrl ? (
          <Canvas
            className="h-full w-full"
            camera={{ position: [0, 0, 5], fov: 45, far: 1_000_000 }}
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
            <color attach="background" args={['#171A28']} />
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[5, 8, 5]}
              intensity={2.2}
              castShadow
              shadow-mapSize-width={4096}
              shadow-mapSize-height={4096}
            />
            {modelGLBUrl && !isUploading ? (
              <Suspense key={modelGLBUrl} fallback={<ModelFallback />}>
                <ThreeModel url={modelGLBUrl} />
              </Suspense>
            ) : (
              <></>
            )}
          </Canvas>
        ) : (
          <></>
        )}
      </div>
    </>
  )
}
