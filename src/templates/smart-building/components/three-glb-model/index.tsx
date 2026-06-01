'use client'

import { OrbitControls } from '@react-three/drei'
import { useThree, type ThreeElements } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useThreeModelController } from '@/stores/template/three-model-controller'
import ThreeModelErrorBoundary from './components/three-error-boundary'
import { ModelFallback } from '../model-fallback'
import { ModelLoadError } from './components/model-load-error'
import { detect3DFormatFromUrl } from './utils'
import { useShallow } from 'zustand/react/shallow'
import { useMoveDeviceStore } from '@/stores/template/move-device'
import { GlbScene, UsdzModel } from './components/three-model'

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

const formatCache = new Map<string, Detected3DFormat>()

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
  const { isMovingDevice, isDragging, setIsDragging } = useMoveDeviceStore(
    useShallow((s) => ({
      isMovingDevice: s.deviceId !== null,
      isDragging: s.isDragging,
      setIsDragging: s.setIsDragging,
    }))
  )

  useEffect(() => {
    if (isMovingDevice && isDragging) {
      const handlePointerUpGlobal = () => {
        setIsDragging(false)
      }
      window.addEventListener('pointerup', handlePointerUpGlobal)
      return () =>
        window.removeEventListener('pointerup', handlePointerUpGlobal)
    }
  }, [isMovingDevice, isDragging, setIsDragging])

  useEffect(() => {
    if (isMovingDevice) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
      }
      window.addEventListener('contextmenu', handleContextMenu)
      return () => window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [isMovingDevice])

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
        enabled={!isDragging}
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
