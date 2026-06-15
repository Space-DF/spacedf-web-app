import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { VirtualItem } from '@tanstack/react-virtual'
import Image from 'next/image'
import { Ellipsis, Trash2 } from 'lucide-react'
import { Pencil } from '@/components/icons'
import { useTranslations } from 'next-intl'
import { useDeleteGeofence } from '../../hooks/useDeleteGeofence'
import { useState } from 'react'
import { FeatureId, Geofence } from '@/types/geofence'
import { Skeleton } from '@/components/ui/skeleton'
import { useCache } from '@/hooks/useCache'
import { useGeofenceMapStore } from '@/stores/geofence-map-store'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'

const ROW_HEIGHT = 72
const ROW_GAP = 8

interface Props {
  virtualRow: VirtualItem
  item: Geofence
  onSelectGeofence: (geofence: Geofence) => void
  mutate: () => void
}

const mapInstance = MapInstance.getInstance()

export const GeofenceItem: React.FC<Props> = ({
  virtualRow,
  item,
  onSelectGeofence,
  mutate,
}) => {
  const tCommon = useTranslations('common')
  const tGeofence = useTranslations('geofence')
  const { trigger: deleteGeofence, isMutating: isDeletingGeofence } =
    useDeleteGeofence(item.id)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const syncGeofencesToMap = useGeofenceMapStore(
    (state) => state.syncGeofencesToMap
  )
  const geofencesMap = useGeofenceMapStore((state) => state.geofences)
  const setGeofencesMap = useGeofenceMapStore((state) => state.setGeofences)

  const { clearCacheStartsWith } = useCache()

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    await deleteGeofence()
    setIsDeleteDialogOpen(false)
    const newGeofences = geofencesMap.filter((g) => g.id !== item.id)
    setGeofencesMap(newGeofences)
    clearCacheStartsWith('/api/geofence')
    await mutate()
    const draw = mapInstance.getTerraDraw()
    if (draw) {
      const featureIds = draw
        .getSnapshot()
        .filter((feature) => feature.properties.geofenceId === item.id)
        .filter(Boolean)
        .map((feature) => feature.id) as FeatureId[]
      draw.removeFeatures(featureIds)
    }
    syncGeofencesToMap()
  }

  return (
    <div
      className={cn(
        'absolute left-0 flex w-full items-center justify-between rounded-lg border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-2 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-brand-fill-outermost'
      )}
      style={{
        height: `${ROW_HEIGHT}px`,
        marginBottom: `${ROW_GAP}px`,
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-brand-component-stroke-dark-soft bg-brand-fill-surface">
          <Image
            src="/images/map.webp"
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
            className="h-8 w-8 shrink-0 text-brand-component-text-gray hover:bg-brand-fill-surface hover:text-brand-component-text-dark dark:hover:bg-brand-stroke-outermost"
          >
            <Ellipsis size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2"
            onClick={() => onSelectGeofence(item)}
          >
            <Pencil className="size-4" />
            <span className="text-sm font-medium">{tCommon('edit')}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
            onClick={handleOpenDeleteDialog}
          >
            <Trash2 className="size-4" />
            <span className="text-sm font-medium">{tCommon('delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="dark:bg-brand-component-fill-outermost p-4 sm:max-w-[402px] sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg font-bold text-brand-component-text-dark">
              {tGeofence('delete_confirm_title')}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium text-brand-component-text-gray">
              {tGeofence('delete_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-4">
            <AlertDialogCancel className="h-12 flex-1 border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none">
              {tCommon('cancel')}
            </AlertDialogCancel>
            <Button
              loading={isDeletingGeofence}
              className="h-12 flex-1 items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-negative text-base font-semibold text-white shadow-sm transition-all hover:bg-brand-component-fill-negative hover:opacity-70 dark:border-brand-component-stroke-light"
              onClick={handleConfirmDelete}
            >
              {tCommon('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export const GeofenceRowSkeleton = () => (
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
