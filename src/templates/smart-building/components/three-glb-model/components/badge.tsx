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

const badgeHoverClassName =
  'flex size-full cursor-default items-center justify-center rounded-full transition-transform duration-200 ease-out hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-component-text-light/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

type MetricBadgeProps = {
  value: string | undefined
  unit_of_measurement: string
  icon?: string
}

function MetricBadge({ value, unit_of_measurement, icon }: MetricBadgeProps) {
  const compact = value ? `${value}${unit_of_measurement}` : ''
  const colors = useMetricBadgePalette(icon)
  return (
    <div
      className={`drop-shadow-lg flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-full font-semibold tabular-nums`}
      style={{ width: BADGE_SIZE, height: BADGE_SIZE, ...colors }}
    >
      <div className="flex flex-col items-center">
        {icon && (
          <Image
            src={icon}
            alt={value || ''}
            width={16}
            height={16}
            className="shrink-0"
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

const EntityBadgeWithTooltip = memo(function EntityBadgeWithTooltip({
  entity,
  device_properties,
  tooltipContentClassName,
  centeredTrigger,
}: {
  entity: Entity
  device_properties?: DeviceProperties
  tooltipContentClassName: string
  centeredTrigger?: boolean
}) {
  const entityRealtimeValue = useDashboardStore(
    (state) => state.entities[entity.unique_key]
  )
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
    />
  )

  const triggerInner = <div className={badgeHoverClassName}>{badge}</div>

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {centeredTrigger ? (
          <div className="relative z-0 flex size-12 items-center justify-center hover:z-10 focus-within:z-10">
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
  onSelectDevice: () => void
}

const ENTITY_ORBIT_RADIUS = 40

const EntityBadge = memo(function EntityBadge({
  entities,
  device_properties,
  onSelectDevice,
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
              className="absolute z-0 flex items-center justify-center overflow-visible hover:z-10 focus-within:z-10"
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
              />
            </div>
          )
        })}
      </div>
    )
  }

  return <TooltipProvider delayDuration={0}>{body}</TooltipProvider>
})

export default EntityBadge
