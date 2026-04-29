'use client'

import SpacedfLogo from '@/components/common/spacedf-logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useDeviceModalStore } from '@/stores/template/device-modal'
import { Area } from '@/types/area'
import { Building } from '@/types/building'
import { Floor } from '@/types/floor'
import { getS3Url } from '@/utils'
import { Canvas } from '@react-three/fiber'
import Image from 'next/image'
import { Suspense, useMemo, useState } from 'react'
import { ImportThreeModel } from './components/import-file'
import ThreeModel, { ModelFallback } from './components/three-glb-model'
import { ThreeModelControls } from './components/three-model-controls'
import { DropdownSwitchBuilding } from './components/three-model-controls/components/dropdown-switch-building'
import { DropdownSwitchFloor } from './components/three-model-controls/components/dropdown-switch-floor'
import { useAreaAndBuilding } from './hooks/useAreaAndBuilding'

export default function SmartBuilding() {
  const setIsOpenDeviceModal = useDeviceModalStore((state) => state.setIsOpen)
  const setDeviceModalPosition = useDeviceModalStore(
    (state) => state.setPosition
  )
  const {
    data: areaAndBuilding,
    isLoading: isLoadingAreaAndBuilding,
    mutate: mutateAreaAndBuilding,
  } = useAreaAndBuilding()
  // const isFirstLoadRef = useRef(true)
  // const setGlobalLoading = useGlobalStore((state) => state.setGlobalLoading)
  const [activeBuildingArea, setActiveBuildingArea] = useState<
    Building | Area | undefined
  >(undefined)

  const [activeFloor, setActiveFloor] = useState<Floor | undefined>(undefined)

  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number
    y: number
    worldPoint: { x: number; y: number; z: number }
  } | null>(null)

  const isBuilding = activeBuildingArea?.type === 'building'

  const isAuthenticated = useAuthenticated()

  // useEffect(() => {
  //   if (!isAuthenticated) return
  //   if (isFirstLoadRef.current) {
  //     if (!activeBuildingArea) {
  //       setGlobalLoading(true)
  //       return
  //     }
  //     if (isBuilding && !activeFloor) {
  //       setGlobalLoading(true)
  //     } else {
  //       setGlobalLoading(false)
  //       isFirstLoadRef.current = false
  //     }
  //   }
  // }, [isBuilding, activeFloor, activeBuildingArea, isAuthenticated])

  const isHiddenImport =
    (isAuthenticated && (isBuilding ? !!activeFloor : !!activeBuildingArea)) ||
    !isAuthenticated

  const modelUrl = useMemo(() => {
    if (!isAuthenticated) return getS3Url('glbs/spacedf/building-view.glb')
    return isBuilding
      ? activeFloor?.url_scene_asset
      : (activeBuildingArea as Area)?.url_scene_asset
  }, [isAuthenticated, isBuilding, activeFloor, activeBuildingArea])

  return (
    <>
      <ImportThreeModel
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        isHidden={isHiddenImport}
        refetch={mutateAreaAndBuilding}
      />
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex p-3 justify-between">
          <div className="w-fit">
            <SpacedfLogo />
          </div>
          <div className="flex space-x-3">
            {isAuthenticated && (
              <>
                {isBuilding && (
                  <DropdownSwitchFloor
                    buildingId={activeBuildingArea?.id}
                    activeFloor={activeFloor}
                    setActiveFloor={setActiveFloor}
                  />
                )}
                <DropdownSwitchBuilding
                  activeBuildingArea={activeBuildingArea}
                  setActiveBuildingArea={setActiveBuildingArea}
                  isLoadingAreaAndBuilding={isLoadingAreaAndBuilding}
                  areaAndBuilding={areaAndBuilding}
                />
              </>
            )}
            {modelUrl && (
              <ThreeModelControls
                refetch={mutateAreaAndBuilding}
                activeBuildingArea={activeBuildingArea}
              />
            )}
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
            {modelUrl ? (
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
                {modelUrl ? (
                  <Suspense key={modelUrl} fallback={<ModelFallback />}>
                    <ThreeModel
                      url={modelUrl}
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
