'use client'

import { Button } from '@/components/ui/button'

import { DebouncedSearchInput } from '@/components/common/debounced-search-input'
import { LoaderCircle, PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Nodata } from '@/components/ui'
import UpsertGeofence from './components/upseart-geofence'
import { useGeofenceStore } from '@/stores/geofence-store'
import { useGeofences } from './hooks/useGeofences'
import { useVirtualizer } from '@tanstack/react-virtual'
import { GeofenceItem, GeofenceRowSkeleton } from './components/geofence-item'
import { FeatureId, Geofence } from '@/types/geofence'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { useShallow } from 'zustand/react/shallow'
import { setCookie } from '@/utils'
import { COOKIES, NavigationEnums } from '@/constants'
import { getNewLayouts, useLayout } from '@/stores'
import { useGeofenceMapStore } from '@/stores/geofence-map-store'

const ROW_HEIGHT = 72
const ROW_GAP = 8
const ROW_ESTIMATE = ROW_HEIGHT + ROW_GAP
const SKELETON_COUNT = 5

const mapInstance = MapInstance.getInstance()

const Geofences = () => {
  const t = useTranslations('geofence')
  const tCommon = useTranslations('common')
  const [geofenceDebounce, setGeofenceDebounce] = useState('')
  const [searchKey, setSearchKey] = useState(0)
  const handleSearch = useCallback(
    (value: string) => setGeofenceDebounce(value),
    []
  )
  const {
    data: geofencesList,
    isLoading,
    isReachingEnd,
    setSize,
    mutate,
  } = useGeofences(geofenceDebounce)
  const parentRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

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
    originalGeoFencesIds,
    draftGeoFencesIds,
  } = useGeofenceStore(
    useShallow((state) => ({
      isShowGeofenceControls: state.isShowGeofenceControls,
      setIsShowGeofenceControls: state.setIsShowGeofenceControls,
      setDraftGeoFencesIds: state.setDraftGeoFencesIds,
      setOriginalGeoFencesIds: state.setOriginalGeoFencesIds,
      originalGeoFencesIds: state.originalGeoFencesIds,
      draftGeoFencesIds: state.draftGeoFencesIds,
    }))
  )

  const { setSelectedGeofence, selectedGeofence, geofences } =
    useGeofenceMapStore(
      useShallow((state) => ({
        setSelectedGeofence: state.setSelectedGeofence,
        selectedGeofence: state.selectedGeofence,
        geofences: state.geofences,
      }))
    )

  const handleCloseUpsertGeofence = () => {
    setIsShowGeofenceControls(false)
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
  }

  const handleClose = () => {
    setGeofenceDebounce('')
    setSearchKey((k) => k + 1)
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

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect()
      if (!node) return
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setSize((prev) => prev + 1)
          }
        },
        { root: parentRef.current, rootMargin: '120px' }
      )
      observer.observe(node)
      observerRef.current = observer
    },
    [setSize]
  )

  useEffect(() => () => observerRef.current?.disconnect(), [])

  const handleSetDetailGeofence = (geofence: Geofence) => {
    const draw = mapInstance.getTerraDraw()
    if (!draw) return
    const features = draw.getSnapshot()

    const disabledFeatures = features.filter(
      (f) =>
        f.properties.geofenceId !== geofence.id &&
        f.properties?.mode !== 'select' &&
        !draftGeoFencesIds.includes(f.id as FeatureId)
    )

    const currentSelectedFeature = features.filter(
      (f) => f.properties.geofenceId === geofence.id
    )

    if (!currentSelectedFeature.length) return
    setOriginalGeoFencesIds(
      Array.from(
        new Set([
          ...originalGeoFencesIds,
          ...currentSelectedFeature.map((f) => f.id as FeatureId),
        ])
      )
    )
    disabledFeatures.forEach((f) => {
      draw.updateFeatureProperties(f.id as FeatureId, {
        disabled: true,
      })
    })
  }

  const handleSelectGeofence = useCallback(
    (geofence: Geofence) => {
      mapInstance.flyToBoundary(geofence.features)
      setSelectedGeofence(geofence)
      setIsShowGeofenceControls(true)
    },
    [setSelectedGeofence, setIsShowGeofenceControls]
  )

  useEffect(() => {
    if (!selectedGeofence || !geofences) return
    handleSetDetailGeofence(selectedGeofence)
  }, [selectedGeofence, geofences])

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
        onClose={handleCloseUpsertGeofence}
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
              <PlusIcon size={16} />
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
        <DebouncedSearchInput
          key={searchKey}
          onSearch={handleSearch}
          placeholder={t('geofence_name')}
          delay={500}
          iconClassName="text-brand-component-text-gray"
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
                      ref={loadMoreRef}
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
                    start={virtualRow.start}
                    item={item}
                    onSelectGeofence={handleSelectGeofence}
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

export default memo(Geofences)
