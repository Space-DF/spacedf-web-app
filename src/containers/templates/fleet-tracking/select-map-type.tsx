'use client'

import { MapType } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import DefaultMapType from '/public/images/map-type-thumbnail/default-type.png'
import SatelliteMapType from '/public/images/map-type-thumbnail/satellite-type.png'
import StreetMapType from '/public/images/map-type-thumbnail/street-type.png'

import ImageWithBlur from '@/components/ui/image-blur'
import { cn } from '@/lib/utils'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { Layers2 } from 'lucide-react'
import { StaticImageData } from 'next/image'

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

// const isMapReady = true

export const SelectMapType = () => {
  const { mapType, isMapReady } = useFleetTrackingStore(
    useShallow((state) => ({
      mapType:
        state.mapType ||
        (localStorage.getItem('fleet-tracking:mapType') as MapType) ||
        'default',
      isMapReady: state.isMapReady,
    }))
  )

  //   useEffect(() => {
  //     const isMapRendered = checkMapRendered()
  //     if (!isMapRendered) return

  //     const map = window.mapInstance?.getMapInstance()
  //     if (!map) return

  //     const { style, config } = getMapStyle(mapType, currentTheme)

  //     map.setStyle(style, {
  //       config,
  //       diff: true,
  //     } as any)

  //     setDisabled(true)

  //     const handleStyleData = () => {
  //       setTimeout(() => {
  //         revertMapSources()
  //         setDisabled(false)
  //       }, 500)
  //     }

  //     map.on('styledata', handleStyleData)

  //     return () => {
  //       map.off('styledata', handleStyleData)
  //     }
  //   }, [currentTheme, mapType])

  //   const revertMapSources = () => {
  //     const map = window.mapInstance?.getMapInstance()
  //     if (!map) return

  //     if (mapType === 'default') {
  //       startDrawBuilding()
  //     }

  //     if (mapType === 'street') {
  //       remove3DBuildingLayer()
  //     }

  //     loadMapGroupCluster()
  //     updateClusters()
  //   }

  const currentMapType = mapTypes.find((type) => type.id === mapType)

  if (!isMapReady)
    return (
      <div className="size-16 rounded-lg absolute z-50 left-2 bg-gray-400 bottom-9 animate-pulse"></div>
    )

  return (
    <div className="bottom-2 absolute z-50 flex items-end flex-col justify-end left-2">
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
              //   disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const MapTypeSelection = ({ name, id, thumbnail }: MapTypeItem) => {
  const { mapType, setMapType, isMapReady } = useFleetTrackingStore(
    useShallow((state) => ({
      mapType:
        state.mapType ||
        (localStorage.getItem('fleet-tracking:mapType') as MapType) ||
        'default',
      setMapType: state.setMapType,
      isMapReady: state.isMapReady,
    }))
  )

  const isActive = mapType === id

  return (
    <div
      onClick={() => {
        if (!isMapReady) return

        setMapType(id)
      }}
      className={cn(
        'gap-1 flex flex-1 text-black flex-col items-center justify-center cursor-pointer duration-300'
        // disabled && 'opacity-50 cursor-not-allowed'
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
