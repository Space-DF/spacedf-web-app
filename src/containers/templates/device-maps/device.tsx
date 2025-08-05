'use client'

import { useDeviceStore, Device as DeviceType } from '@/stores/device-store'
import { useDeviceMapsStore } from '@/stores/template/device-maps'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import { ScenegraphLayer } from 'deck.gl'
import { easeOut } from 'popmotion'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import mapboxgl from 'mapbox-gl'
import { MapType } from '@/utils/map'

type CreateRotatingLayerProps = {
  device: DeviceType
  rotation?: number
  model: GLTFWithBuffers
  sizeScale?: number
}

const Device = ({ deviceId }: { deviceId: string }) => {
  const { deviceData, isDeviceDataReady } = useDeviceStore(
    useShallow((state) => ({
      deviceData: state.devices[deviceId],
      isDeviceDataReady: state.initializedSuccess,
    }))
  )

  const overlayId = `device-model-overlay-${deviceId}`

  const { map, isMapReady } = useDeviceMapsStore(
    useShallow((state) => ({
      map: state.map,
      mapType:
        state.mapType ||
        (localStorage.getItem('mapType') as MapType) ||
        'default',
      isMapReady: state.isMapReady,
    }))
  )

  const models = useDeviceStore(useShallow((state) => state.models))

  const deviceModel = models[deviceData.type]

  const [is3DModelReady, setIs3DModelReady] = useState(false)
  // refs to hold latest values
  const deviceModelRef = useRef(deviceModel)
  const deviceDataRef = useRef(deviceData)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const deviceModelOverlayRef = useRef<MapboxOverlay | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // update refs on each render
  useEffect(() => {
    deviceModelRef.current = models[deviceData.type]
    deviceDataRef.current = deviceData
    mapRef.current = map
  }, [models, deviceData, map])

  useEffect(() => {
    if (!isDeviceDataReady || !isMapReady) return

    prepare3DModel()

    if (is3DModelReady) {
      handleRenderDataToMap(
        (localStorage.getItem('modelType') as '2d' | '3d') || '2d'
      )
    }
  }, [isDeviceDataReady, isMapReady, is3DModelReady])

  useEffect(() => {
    const handler = (e: Event) => {
      const { modelType } = (e as CustomEvent).detail

      handleRenderDataToMap(modelType, true)
    }

    window.addEventListener('modelTypeUpdated', handler)

    return () => {
      window.removeEventListener('modelTypeUpdated', handler)
    }
  }, [])

  useEffect(() => {}, [map])

  const handleRenderDataToMap = useCallback(
    (modelType: '2d' | '3d', isChangeModelType: boolean = false) => {
      if (modelType === '2d') {
        render2DModelToMap(isChangeModelType)
      } else {
        render3DModelToMaps(isChangeModelType)
      }
    },
    []
  )

  const render2DModelToMap = useCallback(
    (isChangeModelType: boolean = false) => {
      if (!mapRef.current) return

      if (isChangeModelType) {
        mapRef.current.easeTo({
          pitch: 0,
        })
      }

      deviceModelOverlayRef.current?.setProps({
        layers: [getNewLayer({ opacity: 0 })],
      })

      renderMarker()
    },
    []
  )

  const render3DModelToMaps = useCallback(
    (isChangeModelType: boolean = false) => {
      if (!mapRef.current) return

      if (isChangeModelType) {
        mapRef.current.easeTo({
          pitch: 90,
        })
      }

      hideDeviceMarker()

      deviceModelOverlayRef.current?.setProps({
        layers: [getNewLayer({ opacity: 1 })],
      })
    },
    []
  )

  const prepare3DModel = useCallback(() => {
    setIs3DModelReady(true)
    const defaultType =
      (localStorage.getItem('modelType') as '2d' | '3d') || '2d'

    if (is3DModelReady) return

    const layer = getNewLayer({
      opacity: defaultType === '3d' ? 1 : 0,
    })

    const deviceModelOverlay = new MapboxOverlay({
      layers: [layer],
      id: overlayId,
    })

    deviceModelOverlayRef.current = deviceModelOverlay

    mapRef.current?.addControl(deviceModelOverlay)
  }, [setIs3DModelReady, is3DModelReady])

  const scenegraphData = useMemo(() => {
    return [
      {
        position: [
          ...(deviceDataRef.current.latestLocation as [number, number]),
          20,
        ],
      },
    ]
  }, [deviceDataRef.current.latestLocation])

  const createRotatingLayer = useCallback(
    (
      { device, model, rotation }: CreateRotatingLayerProps,
      opacity: number = 0
    ) => {
      if (!model) return new ScenegraphLayer()

      const isPassedRotation = typeof rotation === 'number'

      const getOrientation = () => {
        if (isPassedRotation)
          return {
            ...(device?.layerProps?.orientation || {}),
            [device?.layerProps?.rotation || '']: rotation,
          }

        return device?.layerProps?.orientation
      }

      const { pitch = 0, yaw = 0, roll = 0 } = getOrientation()

      return new ScenegraphLayer({
        id: device.id,
        data: scenegraphData,
        scenegraph: model,
        getPosition: (d) => d.position,
        opacity: opacity,
        transitions: {
          opacity: {
            duration: 500,
            easing: easeOut,
          },
          getOrientation: {
            duration: 1000,
            easing: easeOut,
          },
        },
        updateTriggers: {
          getPosition: scenegraphData,
          getOrientation: scenegraphData,
          getScale: scenegraphData,
        },
        // Performance optimizations
        autoHighlight: false,
        highlightColor: [0, 0, 128, 128],

        // Culling optimization - chỉ render objects trong viewport
        parameters: {
          cullMode: 'back',
          depthTest: true,
          depthWrite: true,
        },

        pickable: true,
        _lighting: 'pbr',
        ...(device.layerProps || {}),
        getOrientation: [pitch, yaw, roll],

        // LOD (Level of Detail) optimization
        modelMatrix: null, // Set if you need custom transforms

        // Animation optimization
        _animations: null, // Control animations manually if needed

        // Caching
        _instanced: true, // Enable instancing for better performance
        // onClick: () => {
        //   setDeviceSelected(device.id)
        // },
      })
    },
    [scenegraphData]
  )

  // useEffect(() => {
  //   if (deviceModelOverlayRef.current) {
  //     const deck = deviceModelOverlayRef.current.deck;

  //     // Enable GPU timing (for performance monitoring)
  //     deck.setParameters({
  //       timerQueryExtension: true
  //     });
  //   }
  // }, []);

  const getNewLayer = useCallback(
    (
      { rotation, opacity }: { rotation?: number; opacity: number } = {
        rotation: 0,
        opacity: 0,
      }
    ) => {
      const isEmptyRotation = typeof rotation === 'undefined'

      return createRotatingLayer(
        {
          device: deviceDataRef.current,
          model: deviceModelRef.current,
          rotation: isEmptyRotation
            ? deviceDataRef.current.layerProps?.rotation
            : rotation,
        },
        opacity
      )
    },
    []
  )

  const renderMarker = useCallback(() => {
    const map = mapRef.current

    if (!map) return
    const el = document.createElement('div')

    el.className = `${deviceDataRef.current.type}-marker`
    el.id = `${deviceDataRef.current.type}-marker-${deviceDataRef.current.id}`

    // Add style for opacity and transition
    el.style.opacity = '0'
    // el.style.transition = 'opacity 0.5s ease-in-out'

    markerRef.current = new mapboxgl.Marker(el, {
      offset: [0, -90],
    })
      .setLngLat([...(deviceDataRef.current.latestLocation || [0, 0])])
      .addTo(map)

    // requestAnimationFrame(() => {
    //   el.style.opacity = '1'
    // })

    el.classList.add('fade-in')

    // el.addEventListener('click', () => {
    //   setDeviceSelected(deviceDataRef.current.id)
    // })
  }, [])

  const hideDeviceMarker = useCallback(() => {
    if (!markerRef.current) return

    const el = markerRef.current.getElement()

    el.classList.add('fade-out')

    setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }, 600)
  }, [])

  return null
}

export default memo(Device)
