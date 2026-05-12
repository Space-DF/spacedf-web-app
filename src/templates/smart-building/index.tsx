'use client'

import SpacedfLogo from '@/components/common/spacedf-logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useAddDeviceStore } from '@/stores/template/add-device'
import { getS3Url } from '@/utils'
import { Canvas } from '@react-three/fiber'
import Image from 'next/image'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { DialogSelectDeviceFromList } from './components/dialog-select-device-from-list'
import ThreeModel, { ModelFallback } from './components/three-glb-model'
import { ThreeModelControls } from './components/three-model-controls'
import { DropdownSwitchBuilding } from './components/three-model-controls/components/dropdown-switch-building'
import { useGlobalStore } from '@/stores'
import { List } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

export default function SmartBuilding() {
  const t = useTranslations('smartBuilding')

  const isFirstLoadRef = useRef(true)
  const setGlobalLoading = useGlobalStore((state) => state.setGlobalLoading)
  const { building, setIsOpenDeviceModal, setDeviceModalPosition } =
    useAddDeviceStore(
      useShallow((state) => ({
        building: state.building,
        setIsOpenDeviceModal: state.setIsOpen,
        setDeviceModalPosition: state.setPosition,
      }))
    )

  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number
    y: number
    modelPoint: { x: number; y: number; z: number }
  } | null>(null)
  const [selectDeviceDialogOpen, setSelectDeviceDialogOpen] = useState(false)

  const isAuthenticated = useAuthenticated()

  useEffect(() => {
    if (!isAuthenticated) return
    if (isFirstLoadRef.current) {
      if (!building) {
        setGlobalLoading(true)
        return
      }
      setGlobalLoading(false)
      isFirstLoadRef.current = false
    }
  }, [isAuthenticated, building])

  const modelUrl = useMemo(() => {
    if (!isAuthenticated) return getS3Url('glbs/spacedf/building-view.glb')
    return building?.url_scene_asset
  }, [building, isAuthenticated])

  const handleAddDevice = (event: Event) => {
    if (!contextMenuPosition) return
    event.preventDefault()
    setIsOpenDeviceModal(true)
    setDeviceModalPosition({
      x: contextMenuPosition.modelPoint.x,
      y: contextMenuPosition.modelPoint.y,
      z: contextMenuPosition.modelPoint.z,
    })
    setContextMenuPosition(null)
  }

  const handleSelectDevice = (event: Event) => {
    if (!contextMenuPosition) return
    event.preventDefault()
    setDeviceModalPosition({
      x: contextMenuPosition.modelPoint.x,
      y: contextMenuPosition.modelPoint.y,
      z: contextMenuPosition.modelPoint.z,
    })
    setSelectDeviceDialogOpen(true)
    setContextMenuPosition(null)
  }

  const handleRightClick = ({
    clientX,
    clientY,
    modelPoint,
  }: {
    clientX: number
    clientY: number
    modelPoint: { x: number; y: number; z: number }
  }) => {
    setContextMenuPosition({
      x: clientX,
      y: clientY,
      modelPoint,
    })
  }

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex p-3 justify-between">
          <div className="w-fit">
            <SpacedfLogo />
          </div>
          <div className="flex space-x-3">
            {isAuthenticated && <DropdownSwitchBuilding />}
            {modelUrl && <ThreeModelControls />}
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
                      previewPoint={contextMenuPosition?.modelPoint ?? null}
                      onModelContextMenu={handleRightClick}
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
              className="w-36"
            >
              <DropdownMenuItem
                onSelect={handleAddDevice}
                className="group flex items-center gap-2 text-sm font-medium text-brand-component-text-gray group-hover:text-brand-component-text-dark"
              >
                <Image
                  src="/images/plus-circle.svg"
                  alt="Add devices"
                  width={16}
                  height={16}
                  className="group-hover:text-brand-component-text-dark stroke-brand-component-text-gray"
                />
                <span>{t('add_devices')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleSelectDevice}
                className="group flex items-center gap-2 text-sm font-medium text-brand-component-text-gray group-hover:text-brand-component-text-dark"
              >
                <List
                  size={16}
                  className="text-brand-component-text-gray group-hover:text-brand-component-text-dark"
                  aria-hidden
                />
                <span>{t('select_device')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          ) : null}
        </DropdownMenu>
      </div>
      <DialogSelectDeviceFromList
        open={selectDeviceDialogOpen}
        onOpenChange={setSelectDeviceDialogOpen}
      />
    </>
  )
}
