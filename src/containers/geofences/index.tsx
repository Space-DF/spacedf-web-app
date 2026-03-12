'use client'

import { Button } from '@/components/ui/button'

import { InputWithIcon } from '@/components/ui/input'
import { LoaderCircle, PlusIcon, Search } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Nodata } from '@/components/ui'
import UpsertGeofence from './components/upseart-geofence'
import { useGeofenceStore } from '@/stores/geofence-store'
import { useDebounce } from '@/hooks'
import { useGeofences } from './hooks/useGeofences'
import { useVirtualizer } from '@tanstack/react-virtual'
import { GeofenceItem, GeofenceRowSkeleton } from './components/geofence-item'
import { FeatureId, Geofence } from '@/types/geofence'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { useShallow } from 'zustand/react/shallow'
import { setCookie } from '@/utils'
import { COOKIES, NavigationEnums } from '@/constants'
import { getNewLayouts, useLayout } from '@/stores'

const ROW_HEIGHT = 72
const ROW_GAP = 8
const ROW_ESTIMATE = ROW_HEIGHT + ROW_GAP
const SKELETON_COUNT = 5

const mapInstance = MapInstance.getInstance()

export const Geofences = () => {
  const t = useTranslations('geofence')
  const tCommon = useTranslations('common')
  const [geofenceName, setGeofenceName] = useState('')
  const geofenceDebounce = useDebounce(geofenceName, 500)
  const {
    data: geofencesList,
    isLoading,
    isReachingEnd,
    setSize,
    mutate,
  } = useGeofences(geofenceDebounce)
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence>()
  const parentRef = useRef<HTMLDivElement>(null)
  const fetchingRef = useRef(false)

  const { dynamicLayouts, setCookieDirty, toggleDynamicLayout } = useLayout(
    useShallow((state) => ({
      dynamicLayouts: state.dynamicLayouts,
      setCookieDirty: state.setCookieDirty,
      toggleDynamicLayout: state.toggleDynamicLayout,
    }))
  )

  const {
    isShowGeofenceControls,
    setIsShowGeofenceControls,
    setDraftGeoFencesIds,
    setOriginalGeoFencesIds,
  } = useGeofenceStore(
    useShallow((state) => ({
      isShowGeofenceControls: state.isShowGeofenceControls,
      setIsShowGeofenceControls: state.setIsShowGeofenceControls,
      setDraftGeoFencesIds: state.setDraftGeoFencesIds,
      setOriginalGeoFencesIds: state.setOriginalGeoFencesIds,
    }))
  )

  const handleClose = () => {
    setIsShowGeofenceControls(false)
    setGeofenceName('')
    setSelectedGeofence(undefined)
    const draw = mapInstance.getTerraDraw()
    if (!draw) return
    const features = draw.getSnapshot().filter((f) => f.properties?.disabled)
    features.forEach((f) => {
      draw.updateFeatureProperties(f.id as FeatureId, {
        disabled: false,
      })
    })
    setOriginalGeoFencesIds([])
    setDraftGeoFencesIds([])
    const newLayout = getNewLayouts(dynamicLayouts, NavigationEnums.GEOFENCES)
    setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
    setCookieDirty(true)
    toggleDynamicLayout(NavigationEnums.GEOFENCES)
  }

  const count = geofencesList.length
  const virtualCount = isReachingEnd ? count : count + 1

  const rowVirtualizer = useVirtualizer({
    count: virtualCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_ESTIMATE,
    overscan: 5,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse()
    if (!lastItem) return
    if (
      lastItem.index >= count - 1 &&
      !isLoading &&
      !isReachingEnd &&
      !fetchingRef.current
    ) {
      fetchingRef.current = true
      setSize((prev) => prev + 1)
    }
  }, [virtualItems.length, count, isLoading, isReachingEnd, setSize])

  useEffect(() => {
    if (!isLoading) fetchingRef.current = false
  }, [isLoading])

  const handleSelectGeofence = (geofence: Geofence) => {
    const draw = mapInstance.getTerraDraw()
    if (!draw) return
    const features = draw.getSnapshot()

    const disabledFeatures = features.filter(
      (f) => f.properties.geofenceId !== geofence.id
    )

    const currentSelectedFeature = features.filter(
      (f) => f.properties.geofenceId === geofence.id
    )

    setOriginalGeoFencesIds(
      currentSelectedFeature.map((f) => f.id as FeatureId)
    )
    setDraftGeoFencesIds([])
    disabledFeatures.forEach((f) => {
      draw.updateFeatureProperties(f.id as FeatureId, {
        disabled: true,
      })
    })
    setSelectedGeofence(geofence)
    setIsShowGeofenceControls(true)
    //need to fix this to get the correct boundary
    mapInstance.flyToBoundary(geofence.features)
  }

  const handleOpenSlideGeofence = () => {
    const draw = mapInstance.getTerraDraw()
    if (!draw) return
    const features = draw.getSnapshot()
    features.forEach((f) => {
      draw.updateFeatureProperties(f.id as FeatureId, {
        disabled: true,
      })
    })
    setIsShowGeofenceControls(true)
  }

  return (
    <div className="relative flex flex-1 flex-col h-full min-h-0 overflow-hidden">
      <UpsertGeofence
        isOpen={isShowGeofenceControls}
        onClose={handleClose}
        geofence={selectedGeofence}
        mutate={mutate}
      />
      <div className="flex flex-1 flex-col gap-4 min-h-0 overflow-hidden px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-brand-component-text-dark">
            {t('geofences')}
          </div>
          <div className="flex space-x-1 items-center">
            <Button className="h-8 gap-x-2" onClick={handleOpenSlideGeofence}>
              <span className="text-xs font-semibold leading-4">
                {tCommon('add_geofence')}
              </span>
              <Image src="/images/plus.svg" alt="plus" width={16} height={16} />
            </Button>
            <div
              className="group h-max cursor-pointer rounded-sm p-1 hover:bg-brand-fill-surface hover:dark:bg-brand-stroke-outermost"
              onClick={handleClose}
            >
              <PlusIcon
                width={24}
                height={24}
                className="rotate-45 duration-300 group-hover:-rotate-45 group-hover:scale-110 dark:text-brand-dark-text-gray"
              />
            </div>
          </div>
        </div>
        <InputWithIcon
          prefixCpn={
            <Search size={18} className="text-brand-component-text-gray" />
          }
          placeholder={t('geofence_name')}
          wrapperClass="w-full"
          value={geofenceName}
          onChange={(e) => setGeofenceName(e.target.value)}
        />

        <div className="flex-1 min-h-0 overflow-y-auto pb-4" ref={parentRef}>
          {isLoading && geofencesList.length === 0 ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
                <GeofenceRowSkeleton key={idx} />
              ))}
            </div>
          ) : geofencesList.length === 0 ? (
            <Nodata content={tCommon('nodata', { module: t('geofences') })} />
          ) : (
            <div
              className="relative w-full"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {virtualItems.map((virtualRow) => {
                if (virtualRow.index >= count) {
                  return (
                    <div
                      key={virtualRow.key}
                      className="absolute left-0 flex w-full items-center justify-center"
                      style={{
                        height: `${ROW_ESTIMATE}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <LoaderCircle className="text-brand-bright-lavender size-6 animate-spin" />
                    </div>
                  )
                }

                const item = geofencesList[virtualRow.index]
                return (
                  <GeofenceItem
                    key={virtualRow.key}
                    virtualRow={virtualRow}
                    item={item}
                    onSelectGeofence={handleSelectGeofence}
                    mutate={mutate}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
