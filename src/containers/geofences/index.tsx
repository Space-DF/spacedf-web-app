'use client'

import { Button } from '@/components/ui/button'

import { InputWithIcon } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { LoaderCircle, PlusIcon, Search } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Nodata } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import UpsertGeofence from './components/upseart-geofence'
import { useGeofenceStore } from '@/stores/geofence-store'
import { useDebounce } from '@/hooks'
import { useGeofences } from './hooks/useGeofences'
import { useVirtualizer } from '@tanstack/react-virtual'
import { GeofenceItem } from './components/geofence-item'
import { Geofence } from '@/types/geofence'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'

const ROW_HEIGHT = 72
const ROW_GAP = 8
const ROW_ESTIMATE = ROW_HEIGHT + ROW_GAP
const SKELETON_COUNT = 5

const GeofenceRowSkeleton = () => (
  <div
    className={cn(
      'flex items-center justify-between rounded-lg border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-2 dark:bg-brand-fill-outermost'
    )}
    style={{ height: ROW_HEIGHT }}
  >
    <div className="flex min-w-0 items-center gap-3">
      <Skeleton className="size-12 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
  </div>
)

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

  const { isShowGeofenceControls, setIsShowGeofenceControls } =
    useGeofenceStore((state) => ({
      isShowGeofenceControls: state.isShowGeofenceControls,
      setIsShowGeofenceControls: state.setIsShowGeofenceControls,
    }))

  const handleClose = () => {
    setIsShowGeofenceControls(false)
    setGeofenceName('')
    setSelectedGeofence(undefined)
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
    setSelectedGeofence(geofence)
    setIsShowGeofenceControls(true)
    mapInstance.flyToBoundary(geofence.features)
  }

  return (
    <div className="relative flex flex-1 flex-col h-full overflow-hidden">
      <UpsertGeofence
        isOpen={isShowGeofenceControls}
        onClose={handleClose}
        geofence={selectedGeofence}
        mutate={mutate}
      />
      <div className="flex flex-1 flex-col gap-4 h-full overflow-hidden px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-brand-component-text-dark">
            {t('geofences')}
          </div>
          <div className="flex space-x-1 items-center">
            <Button
              className="h-8 gap-x-2"
              onClick={() => setIsShowGeofenceControls(true)}
            >
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

        <div className="flex-1 overflow-auto pb-4 min-h-0" ref={parentRef}>
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
