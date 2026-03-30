import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronLeft, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { InputWithIcon } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EventItem, EventItemSkeleton } from '../event-item'
import { useEvents } from '../../hooks/useEvents'
import { useTripAddress } from '../trip-history/hooks/useTripAddress'

interface AllEventProps {
  deviceId: string
  onClose: () => void
}

export const AllEvent = ({ deviceId, onClose }: AllEventProps) => {
  const t = useTranslations('event')
  const [searchValue, setSearchValue] = useState('')
  const {
    data: events,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useEvents(deviceId, searchValue)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const allItems = useMemo(() => events?.results ?? [], [events])

  const { validLocations, addressIndexByEventIndex } = useMemo(() => {
    const validLocations: [number, number][] = []
    const addressIndexByEventIndex: Record<number, number> = {}

    allItems.forEach((e, eventIndex) => {
      const longitude = e.location?.longitude
      const latitude = e.location?.latitude

      if (typeof longitude !== 'number' || typeof latitude !== 'number') return

      addressIndexByEventIndex[eventIndex] = validLocations.length
      validLocations.push([longitude, latitude])
    })

    return { validLocations, addressIndexByEventIndex }
  }, [allItems])

  const { data: addresses, isLoading: isLoadingAddresses } =
    useTripAddress(validLocations)

  const getAddress = useCallback(
    (index: number) => {
      if (isLoadingAddresses) return <Skeleton className="h-3 w-32" />
      const addressIndex = addressIndexByEventIndex[index]
      if (addressIndex === undefined) return undefined
      const placeName = addresses?.[addressIndex]?.features?.[0]?.place_name
      return placeName && placeName.trim() ? placeName : 'Unknown'
    },
    [addresses, isLoadingAddresses, addressIndexByEventIndex]
  )

  const rowVirtualizer = useVirtualizer({
    count: hasMore ? allItems.length + 1 : allItems.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 122,
    overscan: 5,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem) return

    if (lastItem.index >= allItems.length - 1 && hasMore && !isLoadingMore) {
      loadMore()
    }
  }, [hasMore, isLoadingMore, allItems.length, loadMore, virtualItems])

  const renderRow = useCallback(
    (index: number) => {
      const isLoaderRow = index >= allItems.length

      if (isLoaderRow) {
        return (
          <div className="flex items-center justify-center py-3 text-xs text-brand-component-text-gray">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-component-text-gray border-t-transparent" />
          </div>
        )
      }

      const item = allItems[index]
      return <EventItem item={item} address={getAddress(index)} />
    },
    [allItems, getAddress]
  )

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center">
          <ChevronLeft
            className="size-6 cursor-pointer text-brand-component-text-gray"
            onClick={onClose}
          />
          <Label className="text-brand-component-text-dark text-sm font-semibold">
            {t('events')}
          </Label>
        </div>
      </div>

      <InputWithIcon
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search for events"
        prefixCpn={<Search size={14} />}
        wrapperClass="w-full"
      />

      {isLoading ? (
        <div className="flex flex-col gap-2 pr-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <EventItemSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex-1 space-y-1 overflow-y-auto pr-1"
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: 'relative',
              width: '100%',
            }}
          >
            {virtualItems.map((virtualRow) => (
              <div
                key={virtualRow.index}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: 4,
                }}
              >
                {renderRow(virtualRow.index)}
              </div>
            ))}
          </div>
          {isLoadingMore && (
            <div className="flex items-center justify-center py-3 text-xs text-brand-component-text-gray">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-component-text-gray border-t-transparent" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
