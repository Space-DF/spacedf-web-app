'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DeviceProperties } from '@/types/device'
import { Entity } from '@/types/entity'
import Image from 'next/image'
import { memo } from 'react'
import { useMetricBadgePalette } from '../hooks/useMetricBadgePalette'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useMoveDeviceStore } from '@/stores/template/move-device'
import { cn } from '@/lib/utils'
import { Move } from 'lucide-react'

const BADGE_SIZE = 50

function getPropertyValue(
  device_properties: DeviceProperties | undefined,
  category: string
): string | undefined {
  if (!device_properties) return undefined
  const raw = (device_properties as Record<string, unknown>)[category]
  if (raw === undefined || raw === null) return undefined
  return String(raw)
}

type MetricBadgeProps = {
  value: string | undefined
  unit_of_measurement: string
  icon?: string
  isDraggingThis?: boolean
}

function MetricBadge({
  value,
  unit_of_measurement,
  icon,
  isDraggingThis,
}: MetricBadgeProps) {
  const compact = value ? `${value}${unit_of_measurement}` : ''
  const colors = useMetricBadgePalette(icon)
  const isEditMode = useMoveDeviceStore((state) => state.isEditMode)
  return (
    <div
      className={cn(
        'drop-shadow-lg flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-full font-semibold tabular-nums transition-all',
        isDraggingThis
          ? 'ring-[6px] ring-[#2196F399]'
          : isEditMode
            ? 'ring-[8px] ring-white/20'
            : ''
      )}
      style={{ width: BADGE_SIZE, height: BADGE_SIZE, ...colors }}
    >
      <div className="flex flex-col items-center">
        {icon && (
          <Image
            src={icon}
            alt={value || ''}
            width={16}
            height={16}
            className="shrink-0 pointer-events-none"
            decoding="async"
          />
        )}
        <span className="min-w-0 max-w-10 break-words text-center text-xs leading-tight line-clamp-1">
          {compact}
        </span>
      </div>
    </div>
  )
}

interface EntityBadgeWithTooltipProps {
  entity: Entity
  device_properties?: DeviceProperties
  tooltipContentClassName: string
  centeredTrigger?: boolean
  onClick?: () => void
  isDraggingThis?: boolean
}

const EntityBadgeWithTooltip = memo(function EntityBadgeWithTooltip({
  entity,
  device_properties,
  tooltipContentClassName,
  centeredTrigger,
  onClick,
  isDraggingThis,
}: EntityBadgeWithTooltipProps) {
  const entityRealtimeValue = useDashboardStore(
    (state) => state.entities[entity.unique_key]
  )
  const isEditMode = useMoveDeviceStore((state) => state.isEditMode)
  const staticValue = device_properties
    ? getPropertyValue(device_properties, entity.category)
    : undefined

  if (!entity.icon) {
    return null
  }

  const badgeValue = entityRealtimeValue ?? staticValue
  const tooltipText =
    `${entity.name}: ${badgeValue ?? '--'}${entity.unit_of_measurement ?? ''}`.trim()

  const badge = (
    <MetricBadge
      value={badgeValue}
      unit_of_measurement={entity.unit_of_measurement}
      icon={entity.icon}
      isDraggingThis={isDraggingThis}
    />
  )

  const triggerInner = (
    <div
      className={cn(
        'flex size-full cursor-pointer items-center justify-center rounded-full transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-component-text-light/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        !isEditMode && 'hover:scale-110'
      )}
      onClick={centeredTrigger ? undefined : onClick}
    >
      {badge}
    </div>
  )

  return (
    <Tooltip open={!isEditMode ? undefined : false}>
      <TooltipTrigger asChild>
        {centeredTrigger ? (
          <div
            className="relative z-0 flex size-12 items-center justify-center hover:z-10 focus-within:z-10 cursor-pointer"
            onClick={onClick}
          >
            {triggerInner}
          </div>
        ) : (
          triggerInner
        )}
      </TooltipTrigger>
      <TooltipContent side="top" className={tooltipContentClassName}>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  )
})

interface EntityBadgeProps {
  entities: Entity[]
  device_properties?: DeviceProperties
  onSelectDevice?: () => void
  isDraggingThis?: boolean
}

const ENTITY_ORBIT_RADIUS = 40

const EntityBadge = memo(function EntityBadge({
  entities,
  device_properties,
  onSelectDevice,
  isDraggingThis,
}: EntityBadgeProps) {
  const listEntities = (entities ?? []).filter(
    (entity) => entity.icon && entity.is_enabled
  )
  if (listEntities.length === 0) {
    return null
  }

  let body: React.ReactNode
  if (listEntities.length === 1) {
    const entity = listEntities[0]
    body = (
      <EntityBadgeWithTooltip
        entity={entity}
        device_properties={device_properties}
        tooltipContentClassName="max-w-xs text-xs border-none"
        centeredTrigger
        onClick={onSelectDevice}
        isDraggingThis={isDraggingThis}
      />
    )
  } else {
    const extent = ENTITY_ORBIT_RADIUS + BADGE_SIZE / 2
    const size = extent * 2
    body = (
      <div className="relative" style={{ width: size, height: size }}>
        {listEntities.map((entity, i) => {
          const angle = (2 * Math.PI * i) / listEntities.length - Math.PI / 2
          const cx = extent + Math.cos(angle) * ENTITY_ORBIT_RADIUS
          const cy = extent + Math.sin(angle) * ENTITY_ORBIT_RADIUS
          return (
            <div
              key={entity.id}
              className="absolute cursor-pointer z-0 flex items-center justify-center overflow-visible hover:z-10 focus-within:z-10"
              style={{
                left: cx - BADGE_SIZE / 2,
                top: cy - BADGE_SIZE / 2,
                width: BADGE_SIZE,
                height: BADGE_SIZE,
              }}
              onClick={onSelectDevice}
            >
              <EntityBadgeWithTooltip
                entity={entity}
                device_properties={device_properties}
                tooltipContentClassName="max-w-xs text-xs"
                isDraggingThis={isDraggingThis}
              />
            </div>
          )
        })}
        {isDraggingThis && (
          <div
            className="absolute bg-background size-7 border rounded-lg p-1.5 flex items-center justify-center shadow-lg pointer-events-none"
            style={{
              left: extent - 18,
              top: extent - 18,
            }}
          >
            <Move className="size-4 text-brand-component-text-dark" />
          </div>
        )}
      </div>
    )
  }

  return <TooltipProvider delayDuration={0}>{body}</TooltipProvider>
})

export default EntityBadge
