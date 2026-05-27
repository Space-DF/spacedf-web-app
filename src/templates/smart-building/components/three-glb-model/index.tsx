'use client'

import { Bounds, Center, Html, OrbitControls, useGLTF } from '@react-three/drei'
import {
  useThree,
  type ThreeElements,
  type ThreeEvent,
} from '@react-three/fiber'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Vector3, type Object3D, Box3 } from 'three'
import { USDLoader } from 'three/addons/loaders/USDLoader.js'
import { useLoader } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useThreeModelController } from '@/stores/template/three-model-controller'
import { useGetDevices } from '@/hooks/useDevices'
import { useAddDeviceStore } from '@/stores/template/add-device'
import { DeviceDataOriginal } from '@/types/device'
import EntityBadge from './components/badge'
import { useDeviceStore } from '@/stores/device-store'
import ThreeModelErrorBoundary from './components/three-error-boundary'
import { ModelFallback } from '../model-fallback'
import { ModelLoadError } from './components/model-load-error'
import { detect3DFormatFromUrl, disposeThreeObject } from './utils'
import { useShallow } from 'zustand/react/shallow'
import { useLayout } from '@/stores'
import { NavigationEnums } from '@/constants'

type ModelProps = ThreeElements['group'] & {
  url: string
  previewPoint?: { x: number; y: number; z: number } | null
  onModelContextMenu?: (payload: {
    clientX: number
    clientY: number
    modelPoint: { x: number; y: number; z: number }
  }) => void
}

type Detected3DFormat = 'glb' | 'usdz' | 'unknown'

const DEFAULT_MODEL_OPACITY = 0.35
const DISPOSE_DELAY_MS = 120_000

const pendingDisposals = new Map<string, ReturnType<typeof setTimeout>>()

const formatCache = new Map<string, Detected3DFormat>()

const DRAG_THRESHOLD_PX = 3

const RIGHT_CLICK_BUTTON_CODE = 2

const DeviceMarker = memo(({ device }: { device: DeviceDataOriginal }) => {
  const setDeviceSelected = useDeviceStore((state) => state.setDeviceSelected)
  const { toggleDynamicLayout, dynamicLayouts, setCookieDirty } = useLayout(
    useShallow((state) => ({
      toggleDynamicLayout: state.toggleDynamicLayout,
      dynamicLayouts: state.dynamicLayouts,
      setCookieDirty: state.setCookieDirty,
    }))
  )
  const handleSelectEntity = useCallback(() => {
    setDeviceSelected(device.device.id)
    if (!dynamicLayouts.includes(NavigationEnums.DEVICES)) {
      toggleDynamicLayout(NavigationEnums.DEVICES)
      setCookieDirty(true)
    }
  }, [
    device.device.id,
    dynamicLayouts,
    toggleDynamicLayout,
    setDeviceSelected,
    setCookieDirty,
  ])

  if (!device.position) return <></>
  return (
    <Html
      position={[device.position.x, device.position.y, device.position.z]}
      center
      distanceFactor={10}
      zIndexRange={[0, 0]}
    >
      <div className="flex flex-col items-center cursor-pointer">
        <div className="relative">
          <EntityBadge
            entities={device.entities ?? []}
            device_properties={device.device_properties}
            onSelectDevice={handleSelectEntity}
          />
        </div>
      </div>
    </Html>
  )
})

DeviceMarker.displayName = 'DeviceMarker'

function PreviewPointMarker({
  point,
}: {
  point: { x: number; y: number; z: number }
}) {
  return (
    <group position={[point.x, point.y, point.z]}>
      <mesh>
        <sphereGeometry args={[0.06, 18, 18]} />
        <meshStandardMaterial
          color="#60A5FA"
          emissive="#60A5FA"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  )
}

function setObjectOpacity(root: Object3D, opacity: number) {
  root.traverse((obj) => {
    const anyObj = obj as any
    const materials = anyObj.material
      ? Array.isArray(anyObj.material)
        ? anyObj.material
        : [anyObj.material]
      : []

    for (const mat of materials) {
      if (!mat) continue
      mat.transparent = opacity < 1
      mat.opacity = opacity
      if ('depthWrite' in mat) mat.depthWrite = false
      mat.needsUpdate = true
    }
  })
}

function FitOnRefocus({
  children,
  previewPoint,
}: {
  children: React.ReactNode
  previewPoint?: { x: number; y: number; z: number } | null
}) {
  const objectRef = useRef<Object3D | null>(null)
  const camera = useThree((s) => s.camera)
  const { controls, focusOnWorldPoint, fitToBox } = useThreeModelController(
    useShallow((s) => ({
      controls: s.controls,
      focusOnWorldPoint: s.focusOnWorldPoint,
      fitToBox: s.fitToBox,
    }))
  )
  const hasSavedInitialRef = useRef(false)
  const buildingId = useAddDeviceStore((state) => state.building?.id)
  const { data: devices } = useGetDevices({
    buildingId,
  })
  const deviceSelected = useDeviceStore((state) => state.deviceSelected)

  useEffect(() => {
    if (!controls) return

    if (deviceSelected) {
      const row = devices.find((d) => d.device.id === deviceSelected)
      if (!row?.position) return

      let cancelled = false
      const run = () => {
        if (cancelled) return
        const obj = objectRef.current
        if (!obj || !row.position) return
        const { x, y, z } = row.position
        const world = new Vector3(x, y, z).applyMatrix4(obj.matrixWorld)
        const toward = world.clone().sub(camera.position)
        if (toward.lengthSq() > 1e-12) {
          toward.normalize()
          const perp = new Vector3().crossVectors(toward, camera.up)
          if (perp.lengthSq() < 1e-12)
            perp.crossVectors(toward, new Vector3(1, 0, 0))
          perp.normalize()
          const dist = world.distanceTo(camera.position)
          world.addScaledVector(perp, Math.max(1e-4, dist * 1e-4))
        }
        focusOnWorldPoint(world)
      }

      const outer = requestAnimationFrame(() => {
        if (cancelled) return
        requestAnimationFrame(run)
      })

      return () => {
        cancelled = true
        cancelAnimationFrame(outer)
      }
    } else {
      const obj = objectRef.current
      if (!obj) return

      const run = () => {
        const box = new Box3().setFromObject(obj)
        fitToBox(box, {
          durationMs: 800,
          onComplete: () => {
            if (!hasSavedInitialRef.current) {
              controls.saveState()
              hasSavedInitialRef.current = true
            }
          },
        })
      }

      const outer = requestAnimationFrame(run)
      return () => {
        cancelAnimationFrame(outer)
      }
    }
  }, [deviceSelected, devices, controls, focusOnWorldPoint, fitToBox, camera])

  return (
    <group ref={objectRef as any}>
      {children}
      {previewPoint ? <PreviewPointMarker point={previewPoint} /> : null}
      {devices.map((device) => (
        <DeviceMarker key={device.id} device={device} />
      ))}
    </group>
  )
}

function GlbScene({
  url,
  onModelContextMenu,
  previewPoint,
  ...props
}: Required<Pick<ModelProps, 'url'>> &
  Pick<ModelProps, 'onModelContextMenu'> &
  Pick<ModelProps, 'previewPoint'> &
  ThreeElements['group']) {
  const { scene } = useGLTF(url)
  const invalidate = useThree((s) => s.invalidate)
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null)

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (event.nativeEvent.button === RIGHT_CLICK_BUTTON_CODE) {
      pointerDownPosRef.current = {
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY,
      }
    }
  }, [])

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.nativeEvent.button === RIGHT_CLICK_BUTTON_CODE) {
        const downPos = pointerDownPosRef.current
        pointerDownPosRef.current = null

        if (!downPos) return

        const dx = event.nativeEvent.clientX - downPos.x
        const dy = event.nativeEvent.clientY - downPos.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > DRAG_THRESHOLD_PX) return

        event.nativeEvent.preventDefault()
        event.stopPropagation()

        const world = event.point.clone()
        const model = scene.worldToLocal(world.clone())
        onModelContextMenu?.({
          clientX: event.nativeEvent.clientX,
          clientY: event.nativeEvent.clientY,
          modelPoint: {
            x: model.x,
            y: model.y,
            z: model.z,
          },
        })
      }
    },
    [onModelContextMenu, scene]
  )

  useEffect(() => {
    const pending = pendingDisposals.get(url)
    if (pending) {
      clearTimeout(pending)
      pendingDisposals.delete(url)
    }

    setObjectOpacity(scene, DEFAULT_MODEL_OPACITY)
    invalidate()

    return () => {
      const timer = setTimeout(() => {
        pendingDisposals.delete(url)
        disposeThreeObject(scene)
        useGLTF.clear(url)
        invalidate()
      }, DISPOSE_DELAY_MS)
      pendingDisposals.set(url, timer)
    }
  }, [scene, url, invalidate])

  return (
    <group {...props}>
      <Bounds observe margin={1.15}>
        <Center>
          <FitOnRefocus previewPoint={previewPoint}>
            <primitive
              object={scene}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            />
          </FitOnRefocus>
        </Center>
      </Bounds>
    </group>
  )
}

function UsdzModel({
  url,
  onModelContextMenu,
  previewPoint,
  ...props
}: Required<Pick<ModelProps, 'url'>> &
  Pick<ModelProps, 'onModelContextMenu'> &
  Pick<ModelProps, 'previewPoint'> &
  ThreeElements['group']) {
  const object = useLoader(USDLoader, url)
  const invalidate = useThree((s) => s.invalidate)
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null)

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (event.nativeEvent.button === RIGHT_CLICK_BUTTON_CODE) {
      pointerDownPosRef.current = {
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY,
      }
    }
  }, [])

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.nativeEvent.button === RIGHT_CLICK_BUTTON_CODE) {
        const downPos = pointerDownPosRef.current
        pointerDownPosRef.current = null

        if (!downPos) return

        const dx = event.nativeEvent.clientX - downPos.x
        const dy = event.nativeEvent.clientY - downPos.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > DRAG_THRESHOLD_PX) return

        event.nativeEvent.preventDefault()
        event.stopPropagation()

        const world = event.point.clone()
        const model = object.worldToLocal(world.clone())
        onModelContextMenu?.({
          clientX: event.nativeEvent.clientX,
          clientY: event.nativeEvent.clientY,
          modelPoint: {
            x: model.x,
            y: model.y,
            z: model.z,
          },
        })
      }
    },
    [onModelContextMenu, object]
  )

  useEffect(() => {
    const pending = pendingDisposals.get(url)
    if (pending) {
      clearTimeout(pending)
      pendingDisposals.delete(url)
    }

    setObjectOpacity(object, DEFAULT_MODEL_OPACITY)
    invalidate()

    return () => {
      const timer = setTimeout(() => {
        pendingDisposals.delete(url)
        disposeThreeObject(object)
        useLoader.clear(USDLoader, url)
        invalidate()
      }, DISPOSE_DELAY_MS)
      pendingDisposals.set(url, timer)
    }
  }, [object, url, invalidate])

  return (
    <group {...props}>
      <Bounds observe margin={1.15}>
        <Center>
          <FitOnRefocus previewPoint={previewPoint}>
            <primitive
              object={object}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            />
          </FitOnRefocus>
        </Center>
      </Bounds>
    </group>
  )
}

export default function ThreeModel({ url, ...props }: ModelProps) {
  const invalidate = useThree((s) => s.invalidate)
  const camera = useThree((s) => s.camera)
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const { setControls, setCamera, autoRotate } = useThreeModelController(
    (s) => ({
      setControls: s.setControls,
      setCamera: s.setCamera,
      autoRotate: s.autoRotate,
    })
  )

  const extensionHint = useMemo<'usdz' | 'glb'>(
    () => (url.toLowerCase().endsWith('.usdz') ? 'usdz' : 'glb'),
    [url]
  )
  const [retryKey, setRetryKey] = useState(0)

  const loadUrl = useMemo(() => {
    if (!retryKey) return url
    try {
      const u = new URL(url)
      u.searchParams.set('__retry', String(retryKey))
      return u.toString()
    } catch {
      const hasQuery = url.includes('?')
      return `${url}${hasQuery ? '&' : '?'}__retry=${retryKey}`
    }
  }, [url, retryKey])

  const [detectedFormat, setDetectedFormat] = useState<
    Detected3DFormat | 'detecting'
  >(() => formatCache.get(loadUrl) ?? 'detecting')

  useEffect(() => {
    const cached = formatCache.get(loadUrl)
    if (cached) {
      setDetectedFormat(cached)
      return
    }

    const ac = new AbortController()
    setDetectedFormat('detecting')

    detect3DFormatFromUrl(loadUrl, ac.signal)
      .then((fmt) => {
        formatCache.set(loadUrl, fmt)
        setDetectedFormat(fmt)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        formatCache.set(loadUrl, extensionHint)
        setDetectedFormat(extensionHint)
      })

    return () => ac.abort()
  }, [loadUrl, extensionHint])

  useEffect(() => {
    setCamera(camera)
    return () => setCamera(undefined)
  }, [camera, setCamera])

  useEffect(() => {
    const controls = controlsRef.current ?? undefined
    setControls(controls)
    return () => setControls(undefined)
  }, [setControls])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.autoRotate = autoRotate
    controls.update()
  }, [autoRotate])

  const shouldUseUsdz =
    detectedFormat === 'detecting'
      ? null
      : detectedFormat === 'usdz' ||
        (detectedFormat === 'unknown' && extensionHint === 'usdz')

  const handleRetry = () => setRetryKey((k) => k + 1)

  return (
    <>
      {shouldUseUsdz === null ? (
        <ModelFallback />
      ) : (
        <ThreeModelErrorBoundary
          resetKey={loadUrl}
          fallback={<ModelLoadError onRetry={handleRetry} />}
        >
          {shouldUseUsdz ? (
            <UsdzModel key={loadUrl} url={loadUrl} {...props} />
          ) : (
            <GlbScene key={loadUrl} url={loadUrl} {...props} />
          )}
        </ThreeModelErrorBoundary>
      )}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.12}
        minDistance={0.01}
        maxDistance={Infinity}
        onChange={() => invalidate()}
      />
    </>
  )
}
