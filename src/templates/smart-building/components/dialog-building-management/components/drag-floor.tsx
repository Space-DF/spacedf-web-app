import { useSortable } from '@dnd-kit/react/sortable'
import { GripVertical } from 'lucide-react'

import { FileArrowUp, PencilSimple, Trash2 } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Floor } from '@/types/floor'
import { DialogFloor } from './dialog-floor'

interface DragFloorProps {
  buildingId: string
  floor: Floor
  index: number
  onSuccess: () => void
  onDelete: () => void
}

export function DragFloor({
  buildingId,
  floor,
  index,
  onSuccess,
  onDelete,
}: DragFloorProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: floor.id,
    index,
  })

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-1 rounded-lg border border-brand-stroke-dark-soft bg-brand-component-fill-dark-soft p-3 transition-opacity',
        isDragging && 'opacity-40'
      )}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label="Drag handle"
        className="touch-none cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-4 shrink-0 text-brand-component-fill-gray-light" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-component-text-dark dark:text-white">
          {floor.name}
        </p>
        {floor.scene_asset && (
          <div className="mt-1 flex items-center gap-x-1">
            <FileArrowUp className="size-5 text-brand-icon-gray" />
            <span className="truncate font-medium text-brand-component-text-gray">
              {floor.scene_asset}
            </span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <DialogFloor
          buildingId={buildingId}
          nextLevel={index + 1}
          floor={floor}
          onSuccess={onSuccess}
          trigger={
            <Button
              type="button"
              size="icon"
              className="size-8"
              aria-label="Edit floor"
            >
              <PencilSimple className="size-3.5" />
            </Button>
          }
        />
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="size-8"
          aria-label="Delete floor"
          onClick={onDelete}
        >
          <Trash2 fill="#FFFFFF" />
        </Button>
      </div>
    </div>
  )
}
