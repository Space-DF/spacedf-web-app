import { useGetDevices } from '@/hooks/useDevices'
import { useDeviceStore } from '@/stores/device-store'
import { useAddDeviceStore } from '@/stores/template/add-device'
import { useThreeModelController } from '@/stores/template/three-model-controller'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Box3, Object3D, Vector3 } from 'three'
import { useShallow } from 'zustand/react/shallow'
import DeviceMarker from './device-marker'

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

export function FitOnRefocus({
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
