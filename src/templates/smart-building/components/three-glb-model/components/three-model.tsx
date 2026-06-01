import { useMoveDeviceStore } from '@/stores/template/move-device'
import { Bounds, Center, useGLTF } from '@react-three/drei'
import {
  ThreeElements,
  ThreeEvent,
  useLoader,
  useThree,
} from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Object3D } from 'three'
import { USDLoader } from 'three/examples/jsm/loaders/USDLoader.js'
import { disposeThreeObject, updateModelOpacity } from '../utils'
import { FitOnRefocus } from './fit-on-refocus'

const pendingDisposals = new Map<string, ReturnType<typeof setTimeout>>()

const RIGHT_CLICK_BUTTON_CODE = 2

const DRAG_THRESHOLD_PX = 3

type ModelProps = ThreeElements['group'] & {
  url: string
  previewPoint?: { x: number; y: number; z: number } | null
  onModelContextMenu?: (payload: {
    clientX: number
    clientY: number
    modelPoint: { x: number; y: number; z: number }
  }) => void
}

const DISPOSE_DELAY_MS = 120_000

export function GlbScene({
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

  const isDragging = useMoveDeviceStore((s) => s.isDragging)
  const [hoveredMesh, setHoveredMesh] = useState<Object3D | null>(null)

  const activeMeshes = useMemo(() => {
    if (isDragging && hoveredMesh) {
      return [hoveredMesh]
    }
    return []
  }, [isDragging, hoveredMesh])

  useEffect(() => {
    if (!isDragging) {
      setHoveredMesh(null)
    }
  }, [isDragging])

  const movingDeviceIdStore = useMoveDeviceStore((s) => s.deviceId)
  const setPosition = useMoveDeviceStore((s) => s.setPosition)

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.nativeEvent.button === RIGHT_CLICK_BUTTON_CODE) {
        if (movingDeviceIdStore) {
          event.nativeEvent.preventDefault()
          event.stopPropagation()
          return
        }
        pointerDownPosRef.current = {
          x: event.nativeEvent.clientX,
          y: event.nativeEvent.clientY,
        }
      }
    },
    [movingDeviceIdStore]
  )

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (movingDeviceIdStore && useMoveDeviceStore.getState().isDragging) {
        event.stopPropagation()
        const world = event.point.clone()
        const model = scene.worldToLocal(world.clone())
        setPosition({ x: model.x, y: model.y, z: model.z })

        const mesh = event.intersections[0]?.object || null
        setHoveredMesh(mesh)
      }
    },
    [movingDeviceIdStore, setPosition, scene]
  )

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.nativeEvent.button === RIGHT_CLICK_BUTTON_CODE) {
        if (movingDeviceIdStore) {
          event.nativeEvent.preventDefault()
          event.stopPropagation()
          return
        }
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
    [onModelContextMenu, scene, movingDeviceIdStore]
  )

  useEffect(() => {
    updateModelOpacity(scene, activeMeshes)
    invalidate()
  }, [scene, activeMeshes, invalidate])

  useEffect(() => {
    const pending = pendingDisposals.get(url)
    if (pending) {
      clearTimeout(pending)
      pendingDisposals.delete(url)
    }

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
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          </FitOnRefocus>
        </Center>
      </Bounds>
    </group>
  )
}

export function UsdzModel({
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

  const isDragging = useMoveDeviceStore((s) => s.isDragging)
  const [hoveredMesh, setHoveredMesh] = useState<Object3D | null>(null)

  const activeMeshes = useMemo(() => {
    if (isDragging && hoveredMesh) {
      return [hoveredMesh]
    }
    return []
  }, [isDragging, hoveredMesh])

  useEffect(() => {
    if (!isDragging) {
      setHoveredMesh(null)
    }
  }, [isDragging])

  const movingDeviceIdStore = useMoveDeviceStore((s) => s.deviceId)
  const setPosition = useMoveDeviceStore((s) => s.setPosition)

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.nativeEvent.button === RIGHT_CLICK_BUTTON_CODE) {
        if (movingDeviceIdStore) {
          event.nativeEvent.preventDefault()
          event.stopPropagation()
          return
        }
        pointerDownPosRef.current = {
          x: event.nativeEvent.clientX,
          y: event.nativeEvent.clientY,
        }
      }
    },
    [movingDeviceIdStore]
  )

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (movingDeviceIdStore && useMoveDeviceStore.getState().isDragging) {
        event.stopPropagation()
        const world = event.point.clone()
        const model = object.worldToLocal(world.clone())
        setPosition({ x: model.x, y: model.y, z: model.z })

        const mesh = event.intersections[0]?.object || null
        setHoveredMesh(mesh)
      }
    },
    [movingDeviceIdStore, setPosition, object]
  )

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.nativeEvent.button === RIGHT_CLICK_BUTTON_CODE) {
        if (movingDeviceIdStore) {
          event.nativeEvent.preventDefault()
          event.stopPropagation()
          return
        }
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
    [onModelContextMenu, object, movingDeviceIdStore]
  )

  useEffect(() => {
    updateModelOpacity(object, activeMeshes)
    invalidate()
  }, [object, activeMeshes, invalidate])

  useEffect(() => {
    const pending = pendingDisposals.get(url)
    if (pending) {
      clearTimeout(pending)
      pendingDisposals.delete(url)
    }

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
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          </FitOnRefocus>
        </Center>
      </Bounds>
    </group>
  )
}
