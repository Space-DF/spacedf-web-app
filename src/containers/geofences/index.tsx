'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputWithIcon } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Ellipsis, PlusIcon, Search, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Nodata } from '@/components/ui'
import { Eye, Pencil } from '@/components/icons'
import AddGeofence from './components/add-geofence'
import { useGeofenceStore } from '@/stores/geofence-store'

interface GeofenceListItem {
  id: number
  name: string
}

const DUMMY_GEOFENCES: GeofenceListItem[] = Array.from({ length: 4 }).map(
  (_, idx) => ({
    id: idx + 1,
    name: `Geofence ${String(idx + 1).padStart(2, '0')}`,
  })
)

export const Geofences = () => {
  const t = useTranslations('geofence')
  const tCommon = useTranslations('common')
  const [geofenceName, setGeofenceName] = useState('')
  const { isShowGeofenceControls, setIsShowGeofenceControls } =
    useGeofenceStore((state) => ({
      isShowGeofenceControls: state.isShowGeofenceControls,
      setIsShowGeofenceControls: state.setIsShowGeofenceControls,
    }))

  const filteredGeofences = useMemo(() => {
    const q = geofenceName.trim().toLowerCase()
    if (!q) return DUMMY_GEOFENCES
    return DUMMY_GEOFENCES.filter((g) => g.name.toLowerCase().includes(q))
  }, [geofenceName])

  const handleClose = () => {
    setIsShowGeofenceControls(false)
  }

  return (
    <div className="relative flex flex-1 flex-col h-full overflow-hidden">
      <AddGeofence isOpen={isShowGeofenceControls} onClose={handleClose} />
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

        <div className="flex-1 overflow-auto pb-4">
          {filteredGeofences.length === 0 ? (
            <Nodata content={tCommon('nodata', { module: t('geofences') })} />
          ) : (
            <div className="flex flex-col gap-2">
              {filteredGeofences.map((item) => {
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-2 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-brand-fill-outermost'
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative size-12 overflow-hidden rounded-lg border border-brand-component-stroke-dark-soft bg-brand-fill-surface">
                        <Image
                          src="/images/map.svg"
                          alt="geofence"
                          fill
                          className="object-cover opacity-60"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-brand-component-text-dark dark:text-white">
                          {item.name}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-brand-component-text-gray hover:bg-brand-fill-surface hover:text-brand-component-text-dark dark:hover:bg-brand-stroke-outermost"
                        >
                          <Ellipsis size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex cursor-pointer items-center gap-2">
                          <Eye />
                          <span className="text-sm font-medium">
                            {t('view_details')}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex cursor-pointer items-center gap-2">
                          <Pencil className="size-4" />
                          <span className="text-sm font-medium">
                            {tCommon('edit')}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="size-4" />
                          <span className="text-sm font-medium">
                            {tCommon('delete')}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
