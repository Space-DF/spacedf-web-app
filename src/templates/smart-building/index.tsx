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
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { DialogSelectDeviceFromList } from './components/dialog-select-device-from-list'
import ThreeModel from './components/three-glb-model'
import { ThreeModelControls } from './components/three-model-controls'
import { DropdownSwitchBuilding } from './components/three-model-controls/components/dropdown-switch-building'
import { useGlobalStore } from '@/stores'
import { List } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'
import { ModelFallback } from './components/model-fallback'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMoveDeviceStore } from '@/stores/template/move-device'
import { useBulkUpdateDevicePositions } from './components/dialog-select-device-from-list/hooks/useBulkUpdateDevicePositions'
import { toast } from 'sonner'
import Pen from '@/components/icons/pen'
import { useParams } from 'next/navigation'

const REDIRECT_FALLBACK_TIMEOUT = 5000

export default function SmartBuilding() {
  const t = useTranslations('smartBuilding')

  const isFirstLoadRef = useRef(true)
  const setGlobalLoading = useGlobalStore((state) => state.setGlobalLoading)
  const { building, setDeviceModalPosition } = useAddDeviceStore(
    useShallow((state) => ({
      building: state.building,
      setDeviceModalPosition: state.setPosition,
    }))
  )

  const { mutateAsync: bulkUpdatePositions, isPending: isUpdating } =
    useBulkUpdateDevicePositions()
  const { isEditMode, setIsEditMode } = useMoveDeviceStore(
    useShallow((state) => ({
      isEditMode: state.isEditMode,
      setIsEditMode: state.setIsEditMode,
    }))
  )

  const handleSaveAllPositions = useCallback(async () => {
    const moved = useMoveDeviceStore.getState().movedPositions
    const deviceIds = Object.keys(moved)
    const buildingId = building?.id
    if (deviceIds.length === 0 || !buildingId) {
      setIsEditMode(false)
      return
    }

    const payload = deviceIds.map((deviceId) => ({
      id: deviceId,
      position: moved[deviceId],
    }))
    await bulkUpdatePositions(payload)
    toast.success(t('assign_device_success'))
    setIsEditMode(false)
  }, [bulkUpdatePositions, building?.id, t, setIsEditMode])

  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number
    y: number
    modelPoint: { x: number; y: number; z: number }
  } | null>(null)
  const [selectDeviceDialogOpen, setSelectDeviceDialogOpen] = useState(false)

  const isAuthenticated = useAuthenticated()

  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  useEffect(() => {
    if (!isAuthenticated) return
    if (!isFirstLoadRef.current) return

    if (building && spaceSlug) {
      setGlobalLoading(false)
      isFirstLoadRef.current = false
      return
    }

    setGlobalLoading(true)
    const timeoutId = setTimeout(() => {
      if (!isFirstLoadRef.current) return
      isFirstLoadRef.current = false
      setGlobalLoading(false)
    }, REDIRECT_FALLBACK_TIMEOUT)

    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, building, spaceSlug, setGlobalLoading])

  const modelUrl = useMemo(() => {
    if (!isAuthenticated || !building?.url_scene_asset)
      return getS3Url('glbs/spacedf/building-view.glb')
    return building?.url_scene_asset
  }, [building?.url_scene_asset, isAuthenticated])

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
          <div className="flex space-x-3 items-start">
            <div className="flex space-x-3 items-center">
              {isAuthenticated && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex">
                        <Switch
                          checked={isEditMode}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              handleSaveAllPositions()
                            } else {
                              setIsEditMode(checked)
                            }
                          }}
                          disabled={isUpdating}
                          className="h-8 w-14"
                          thumbClassName="h-7 w-7 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0"
                          thumbIcon={<Pen className="text-foreground" />}
                          aria-label={t('turn_on_edit_mode_digital_twins')}
                          aria-labelledby="digital-twins-tooltip"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="center"
                      className="text-xs border-none"
                    >
                      {t('turn_on_edit_mode_digital_twins')}
                    </TooltipContent>
                  </Tooltip>
                  <DropdownSwitchBuilding />
                </>
              )}
            </div>
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
                <color attach="background" args={['#323337']} />
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
