'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { ImportThreeModel } from './components/import-file'
import ThreeModel, { ModelFallback } from './components/three-glb-model'
import { useModelGLB } from '@/stores/template/model-glb'
import { useShallow } from 'zustand/react/shallow'
import { useShowDummyData } from '@/hooks/useShowDummyData'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import SpacedfLogo from '@/components/common/spacedf-logo'
import { ThreeModelControls } from './components/three-model-controls'
import { useGlobalStore } from '@/stores'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'
import { useDeviceModalStore } from '@/stores/template/device-modal'
import { DropdownSwitchFloor } from './components/three-model-controls/components/dropdown-switch-floor'

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

  useEffect(
    () => () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
    },
    []
  )

  const setIsOpenDeviceModal = useDeviceModalStore((state) => state.setIsOpen)
  const setDeviceModalPosition = useDeviceModalStore(
    (state) => state.setPosition
  )

  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number
    y: number
    worldPoint: { x: number; y: number; z: number }
  } | null>(null)

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
        isHidden={!!modelGLBUrl || (!currentSpace && isAuthenticated)}
      />
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex p-3 justify-between">
          <div className="w-fit">
            <SpacedfLogo />
          </div>
          <div className="flex space-x-3">
            <DropdownSwitchFloor />
            {modelGLBUrl ? <ThreeModelControls /> : <></>}
          </div>
        </div>
      </div>
      <div className="relative h-full bg-brand-component-fill-smart-building-canvas w-full">
        <DropdownMenu
          open={contextMenuPosition !== null}
          onOpenChange={(open) => {
            if (!open) setContextMenuPosition(null)
          }}
        >
          <div className="h-full w-full">
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
                <color attach="background" args={['#2A2A2A']} />
                <ambientLight intensity={0.6} />
                <directionalLight
                  position={[5, 8, 5]}
                  intensity={2.2}
                  castShadow
                  shadow-mapSize-width={4096}
                  shadow-mapSize-height={4096}
                />
                {modelGLBUrl ? (
                  <Suspense key={modelGLBUrl} fallback={<ModelFallback />}>
                    <ThreeModel
                      url={modelGLBUrl}
                      onModelContextMenu={({
                        clientX,
                        clientY,
                        worldPoint,
                      }) => {
                        setContextMenuPosition({
                          x: clientX,
                          y: clientY,
                          worldPoint,
                        })
                      }}
                    />
                  </Suspense>
                ) : null}
              </Canvas>
            ) : null}
          </div>
          {contextMenuPosition ? (
            <DropdownMenuContent
              sideOffset={0}
              style={{
                position: 'fixed',
                left: contextMenuPosition.x,
                top: contextMenuPosition.y,
              }}
            >
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  setIsOpenDeviceModal(true)
                  setDeviceModalPosition({
                    x: contextMenuPosition.worldPoint.x,
                    y: contextMenuPosition.worldPoint.y,
                    z: contextMenuPosition.worldPoint.z,
                  })
                  setContextMenuPosition(null)
                }}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/plus-circle.svg"
                  alt="Reset view"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium text-brand-component-text-dark">
                  Add devices
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          ) : null}
        </DropdownMenu>
      </div>
    </>
  )
}
