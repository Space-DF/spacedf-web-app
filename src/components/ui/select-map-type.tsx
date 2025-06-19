'use client'

import { MapType, useGlobalStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import ImageWithBlur from './image-blur'
import DefaultMapType from '/public/images/map-type-thumbnail/default-type.png'
import SatelliteMapType from '/public/images/map-type-thumbnail/satellite-type.png'
import StreetMapType from '/public/images/map-type-thumbnail/street-type.png'

import { cn } from '@/lib/utils'
import { Layers2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { StaticImageData } from 'next/image'
import { useEffect, useState } from 'react'
import { checkMapRendered } from '@/app/[locale]/[organization]/(withDynamicLayout)/digital-twins/helper'
import { useMapGroupCluster } from '@/app/[locale]/[organization]/(withDynamicLayout)/digital-twins/hooks/useMapGroupCluster'
import { useDraw3DBuilding } from '@/app/[locale]/[organization]/(withDynamicLayout)/digital-twins/hooks/useDraw3DBuilding'

// const currentMap: MapType = 'default'

type MapTypeItem = {
  id: MapType
  name: string
  thumbnail: StaticImageData
}

const mapTypes: MapTypeItem[] = [
  {
    id: 'default',
    name: 'Default',
    thumbnail: DefaultMapType,
  },
  {
    id: '3D_map',
    name: '3D Map',
    thumbnail: SatelliteMapType,
  },
  {
    id: 'street',
    name: 'Street',
    thumbnail: StreetMapType,
  },
]

export const getMapStyle = (
  mapType: MapType,
  currentTheme: 'dark' | 'light'
) => {
  if (mapType === 'street') {
    return {
      style: `mapbox://styles/mapbox/${currentTheme}-v11`,
      config: {},
    }
  }

  if (mapType === '3D_map') {
    return {
      style: `mapbox://styles/mapbox/standard`,
      config: {
        basemap:
          currentTheme === 'dark'
            ? {
                lightPreset: 'dusk',
              }
            : {
                darkPreset: 'night',
              },
      },
    }
  }

  return {
    style: `mapbox://styles/mapbox/${currentTheme}-v11`,
    config: {},
  }
}

export const SelectMapType = () => {
  const { theme, systemTheme } = useTheme()

  const [disabled, setDisabled] = useState(false)

  const { loadMapGroupCluster, updateClusters } = useMapGroupCluster()
  const { startDrawBuilding, remove3DBuildingLayer } = useDraw3DBuilding()

  const { mapType, setMapType } = useGlobalStore(
    useShallow((state) => ({
      mapType: state.mapType,
      setMapType: state.setMapType,
      isMapInitialized: state.isMapInitialized,
    }))
  )

  const currentTheme = (theme === 'system' ? systemTheme : theme) as
    | 'dark'
    | 'light'

  useEffect(() => {
    const mapTypeFromLocalStorage = (localStorage.getItem('map_type') ||
      'default') as MapType

    setMapType(mapTypeFromLocalStorage)
  }, [])

  useEffect(() => {
    const isMapRendered = checkMapRendered()
    if (!isMapRendered) return

    const map = window.mapInstance?.getMapInstance()
    if (!map) return

    const { style, config } = getMapStyle(mapType, currentTheme)

    map.setStyle(style, {
      config,
      diff: true,
    } as any)

    setDisabled(true)

    const handleStyleData = () => {
      setTimeout(() => {
        revertMapSources()
        setDisabled(false)
      }, 500)
    }

    map.on('styledata', handleStyleData)

    return () => {
      map.off('styledata', handleStyleData)
    }
  }, [currentTheme, mapType])

  const revertMapSources = () => {
    const map = window.mapInstance?.getMapInstance()
    if (!map) return

    if (mapType === 'default') {
      startDrawBuilding()
    }

    if (mapType === 'street') {
      remove3DBuildingLayer()
    }

    loadMapGroupCluster()
    updateClusters()
  }

  const currentMapType = mapTypes.find((type) => type.id === mapType)

  return (
    <div className="h-dvh absolute z-50 flex items-end flex-col  justify-end left-2">
      <div className="group flex items-center gap-3 min-h-20 mb-7">
        <div className="border-[2px] rounded-lg border-white shadow-md ">
          <div className="size-16 overflow-hidden rounded-lg relative">
            <ImageWithBlur
              src={currentMapType?.thumbnail || ''}
              alt="map-thumbnail"
              className="absolute inset-0 z-0"
            />
            <div className="bg-gradient-to-b from-transparent from-60% to-black/80 absolute inset-0 z-10"></div>
            <div className="font-medium text-xs text-white w-full absolute bottom-1 z-20 flex items-center justify-center">
              <div className="duration-300 flex items-center justify-center gap-1 group-hover:opacity-0 group-hover:size-0">
                <Layers2 className="size-3" />
                Layers
              </div>

              <p className="duration-300 flex items-center justify-center group-hover:flex group-hover:size-full group-hover:opacity-100 opacity-0 size-0">
                {currentMapType?.name || ''}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg w-0 h-0 -translate-x-full opacity-0 group-hover:opacity-100 group-hover:h-full group-hover:w-full py-1 justify-between duration-300 group-hover:translate-x-0 px-3 flex gap-3 overflow-hidden">
          {mapTypes.map((mapTypeItem) => (
            <MapTypeSelection
              {...mapTypeItem}
              key={mapTypeItem.id}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const MapTypeSelection = ({
  name,
  id,
  thumbnail,
  disabled,
}: MapTypeItem & { disabled: boolean }) => {
  const { mapType, setMapType } = useGlobalStore(
    useShallow((state) => ({
      mapType: state.mapType,
      setMapType: state.setMapType,
    }))
  )

  const isActive = mapType === id

  return (
    <div
      onClick={() => {
        if (disabled) return
        localStorage.setItem('map_type', id)
        setMapType(id)
      }}
      className={cn(
        'gap-1 flex flex-1 text-black flex-col items-center justify-center cursor-pointer duration-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div
        className={cn(
          'duration-300 w-14 border-[2px] h-14 rounded-lg flex-1 overflow-hidden',
          isActive
            ? 'border-brand-stroke-outermost'
            : 'border-transparent hover:scale-110'
        )}
      >
        <ImageWithBlur
          src={thumbnail}
          alt="map-thumbnail"
          className="object-cover"
        />
      </div>
      <div
        className={cn(
          'text-brand-text-gray duration-300',
          isActive && 'text-black font-medium'
        )}
      >
        {name || ''}
      </div>
    </div>
  )
}
