'use client'

import { Bounds, Center, Html, OrbitControls, useGLTF } from '@react-three/drei'
import { useThree, type ThreeElements } from '@react-three/fiber'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'
import { Component, useEffect, useMemo, useRef, useState } from 'react'
import type { Object3D, Texture } from 'three'
import { USDLoader } from 'three/addons/loaders/USDLoader.js'
import { useLoader } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useThreeModelController } from '@/stores/template/three-model-controller'
import { useBounds } from '@react-three/drei'

type ModelProps = ThreeElements['group'] & {
  url: string
}

type Detected3DFormat = 'glb' | 'usdz' | 'unknown'

const FORMAT_PROBE_BYTES = 12
// const DEFAULT_MODEL_OPACITY = 0.35

async function detect3DFormatFromUrl(
  url: string,
  signal?: AbortSignal
): Promise<Detected3DFormat> {
  const res = await fetch(url, {
    signal,
    cache: 'no-store',
    headers: { Range: `bytes=0-${FORMAT_PROBE_BYTES - 1}` },
  })
  if (!res.ok) {
    throw new Error(`Model probe failed: ${res.status} ${res.statusText}`)
  }
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf.slice(0, FORMAT_PROBE_BYTES))

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x67 && // g
    bytes[1] === 0x6c && // l
    bytes[2] === 0x54 && // T
    bytes[3] === 0x46 // F
  ) {
    return 'glb'
  }

  if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return 'usdz'
  }

  return 'unknown'
}

function disposeObject(root: Object3D) {
  root.traverse((obj) => {
    const anyObj = obj as any
    if (anyObj.geometry?.dispose) anyObj.geometry.dispose()

    const materials = anyObj.material
      ? Array.isArray(anyObj.material)
        ? anyObj.material
        : [anyObj.material]
      : []

    for (const mat of materials) {
      if (!mat) continue
      for (const key of Object.keys(mat)) {
        const value = mat[key]
        if (
          value &&
          (value as Texture).isTexture &&
          (value as Texture).dispose
        ) {
          ;(value as Texture).dispose()
        }
      }
      if (mat.dispose) mat.dispose()
    }
  })
}

// function setObjectOpacity(root: Object3D, opacity: number) {
//   root.traverse((obj) => {
//     const anyObj = obj as any
//     const materials = anyObj.material
//       ? Array.isArray(anyObj.material)
//         ? anyObj.material
//         : [anyObj.material]
//       : []

//     for (const mat of materials) {
//       if (!mat) continue
//       mat.transparent = opacity < 1
//       mat.opacity = opacity
//       if ('depthWrite' in mat) mat.depthWrite = false
//       mat.needsUpdate = true
//     }
//   })
// }

function FitOnRefocus({ children }: { children: React.ReactNode }) {
  const api = useBounds()
  const objectRef = useRef<Object3D | null>(null)
  const controls = useThreeModelController((s) => s.controls)
  const hasSavedInitialRef = useRef(false)

  useEffect(() => {
    const run = () => {
      const obj = objectRef.current
      if (!obj) return
      api.refresh(obj).fit()

      if (controls && !hasSavedInitialRef.current) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            controls.update()
            controls.saveState()
            hasSavedInitialRef.current = true
          })
        })
      }
    }
    run()
  }, [api, controls])

  return <group ref={objectRef as any}>{children}</group>
}

function GlbScene({
  url,
  ...props
}: Required<Pick<ModelProps, 'url'>> & ThreeElements['group']) {
  const { scene } = useGLTF(url)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    // setObjectOpacity(scene, DEFAULT_MODEL_OPACITY)
    // invalidate()

    return () => {
      disposeObject(scene)
      useGLTF.clear(url)
      invalidate()
    }
  }, [scene, url, invalidate])

  return (
    <group {...props}>
      <Bounds fit observe margin={1.15}>
        <Center>
          <FitOnRefocus>
            <primitive object={scene} />
          </FitOnRefocus>
        </Center>
      </Bounds>
    </group>
  )
}

function UsdzModel({
  url,
  ...props
}: Required<Pick<ModelProps, 'url'>> & ThreeElements['group']) {
  const object = useLoader(USDLoader, url)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    // setObjectOpacity(object, DEFAULT_MODEL_OPACITY)
    // invalidate()

    return () => {
      disposeObject(object)
      useLoader.clear(USDLoader, url)
      invalidate()
    }
  }, [object, url, invalidate])

  return (
    <group {...props}>
      <Bounds fit observe margin={1.15}>
        <Center>
          <FitOnRefocus>
            <primitive object={object} />
          </FitOnRefocus>
        </Center>
      </Bounds>
    </group>
  )
}

class ThreeModelErrorBoundary extends Component<
  {
    children: React.ReactNode
    fallback: React.ReactNode
    resetKey?: string | number
  },
  { hasError: boolean }
> {
  constructor(props: ThreeModelErrorBoundary['props']) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidUpdate(prevProps: ThreeModelErrorBoundary['props']) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function ModelLoadError({ onRetry }: { onRetry?: () => void }) {
  const t = useTranslations('smartBuilding')
  return (
    <Html center>
      <div className="w-72 overflow-hidden rounded-xl bg-gradient-to-b from-black/55 to-black/35 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-md">
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid size-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
              <span aria-hidden className="text-base leading-none">
                !
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight text-brand-component-text-gray">
                {t('model_load_error')}
              </div>
            </div>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {t('model_load_retry')}
            </button>
          )}
        </div>
      </div>
    </Html>
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
  const [detectedFormat, setDetectedFormat] = useState<
    Detected3DFormat | 'detecting'
  >('detecting')
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

  useEffect(() => {
    const ac = new AbortController()
    setDetectedFormat('detecting')

    detect3DFormatFromUrl(loadUrl, ac.signal)
      .then((fmt) => setDetectedFormat(fmt))
      .catch((err) => {
        if (err.name === 'AbortError') return
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

export function ModelFallback() {
  const t = useTranslations('smartBuilding')
  const [value, setValue] = useState(10)

  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((v) => {
        const next = v + 7
        return next >= 90 ? 20 : next
      })
    }, 250)
    return () => window.clearInterval(id)
  }, [])

  return (
    <Html center>
      <div className="w-[240px] rounded-lg bg-black/40 px-4 py-3 text-white shadow-sm ring-1 ring-white/10 backdrop-blur-md">
        <div className="text-sm font-medium opacity-90 text-brand-component-text-gray">
          {t('loading_model')}
        </div>
        <div className="mt-2">
          <Progress
            value={value}
            className="h-2 bg-white/20"
            indicatorStyle={{ backgroundColor: '#D9D9D9' }}
          />
        </div>
      </div>
    </Html>
  )
}
