'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { geocodingService } from '@/utils/map-geocoding'
import type { GeocodingFeature } from '@maptiler/sdk'
import { MapPin, Search } from 'lucide-react'
import MapLibreGL from 'maplibre-gl'
import useSWR from 'swr'
import { useCallback, useState } from 'react'
import { useDebounce } from '@/hooks'
import { cn } from '@/lib/utils'

type SearchLocationProps = {
  map: MapLibreGL.Map | null
  className?: string
}

function getCenter(feature: GeocodingFeature): [number, number] | null {
  const c = feature.center
  if (Array.isArray(c) && c.length >= 2) {
    const a = c[0],
      b = c[1]
    if (typeof a === 'number' && typeof b === 'number') return [a, b]
  }
  const geom = feature.geometry
  if (geom && 'coordinates' in geom && Array.isArray(geom.coordinates)) {
    const coords = geom.coordinates
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return [coords[0], coords[1]]
    }
  }
  return null
}

function getPlaceName(feature: GeocodingFeature): string {
  return feature.place_name ?? ''
}

export function SearchLocation({ map, className }: SearchLocationProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data: results = [], isValidating: loading } = useSWR(
    debouncedQuery.trim() ? `geocoding-forward-${debouncedQuery.trim()}` : null,
    () => geocodingService.forward(debouncedQuery.trim(), { limit: 8 })
  )

  const handleSelect = useCallback(
    (feature: GeocodingFeature) => {
      const center = getCenter(feature)
      if (map && center) {
        map.flyTo({
          center,
          zoom: 14,
          duration: 800,
          pitch: map.getPitch(),
        })
      }
      setQuery(getPlaceName(feature))
      setOpen(false)
    },
    [map]
  )

  const handleFocus = () => {
    if (query.trim() === '') return
    setOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim() === '') {
      setOpen(false)
      setQuery('')
      return
    }
    setOpen(true)
    setQuery(value)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          className={cn(
            'flex min-w-72 max-w-96 outline-none items-center gap-2 rounded-sm bg-white px-3 shadow-sm transition-colors',
            'dark:border-brand-stroke-outermost dark:bg-brand-fill-outermost',
            className
          )}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Search Location"
            className={cn(
              'h-10 flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground dark:text-white'
            )}
            aria-label="Search location"
            aria-autocomplete="list"
            aria-controls="search-location-list"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        id="search-location-list"
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false} className="rounded-lg border-0">
          <CommandList>
            {loading ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 && query.trim() ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((feature, i) => {
                  const name = getPlaceName(feature)
                  const center = getCenter(feature)
                  return (
                    <CommandItem
                      key={feature.id ?? `${name}-${i}`}
                      value={`${name}-${i}`}
                      onSelect={() => handleSelect(feature)}
                      disabled={!center}
                      className="cursor-pointer"
                    >
                      <MapPin className="mr-2 size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
