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

const BADGE_SIZE = 30

function getPropertyValue(
  device_properties: DeviceProperties | undefined,
  category: string
): string | undefined {
  if (!device_properties) return undefined
  const raw = (device_properties as Record<string, unknown>)[category]
  if (raw === undefined || raw === null) return undefined
  return String(raw)
}

function getEntityTooltipLabel(
  entity: Entity,
  device_properties?: DeviceProperties
): string {
  const segments: string[] = []
  if (entity.name?.trim()) segments.push(entity.name.trim())
  const value = device_properties
    ? getPropertyValue(device_properties, entity.category)
    : undefined
  if (value !== undefined) {
    segments.push(`${value}${entity.unit_of_measurement ?? ''}`.trim())
  }
  return segments.join(': ')
}

function renderEntityContent(entity: Entity) {
  if (!entity.icon) return <></>
  return (
    <Image
      src={entity.icon}
      alt={entity.name}
      width={BADGE_SIZE}
      height={BADGE_SIZE}
    />
  )
}

type MetricBadgeProps = {
  value: string
  unit_of_measurement: string
  paletteClassName: string
}

function MetricBadge({
  value,
  unit_of_measurement,
  paletteClassName,
}: MetricBadgeProps) {
  const compact = `${value}${unit_of_measurement}`

  return (
    <div
      className={`drop-shadow-lg flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-full px-1.5 font-semibold tabular-nums ${paletteClassName}`}
      style={{ width: BADGE_SIZE, height: BADGE_SIZE }}
    >
      <span className="min-w-0 max-w-full break-words text-center text-xs leading-tight line-clamp-2">
        {compact}
      </span>
    </div>
  )
}

export function TemperatureBadge({
  value,
  unit_of_measurement,
}: {
  value: string
  unit_of_measurement: string
}) {
  return (
    <MetricBadge
      value={value}
      unit_of_measurement={unit_of_measurement}
      paletteClassName="bg-[#FCCBCB] text-[#E5372B]"
    />
  )
}

export function HumidityBadge({
  value,
  unit_of_measurement,
}: {
  value: string
  unit_of_measurement: string
}) {
  return (
    <MetricBadge
      value={value}
      unit_of_measurement={unit_of_measurement}
      paletteClassName="bg-[#D9EFFC] text-[#2B8AC1]"
    />
  )
}

export function PressureBadge({
  value,
  unit_of_measurement,
}: {
  value: string
  unit_of_measurement: string
}) {
  return (
    <MetricBadge
      value={value}
      unit_of_measurement={unit_of_measurement}
      paletteClassName="bg-[#F7E6D8] text-[#A35515]"
    />
  )
}

export function ElectricityBadge({
  value,
  unit_of_measurement,
}: {
  value: string
  unit_of_measurement: string
}) {
  return (
    <MetricBadge
      value={value}
      unit_of_measurement={unit_of_measurement}
      paletteClassName="bg-[#DFF6E2] text-[#34B941]"
    />
  )
}

interface EntityBadgeProps {
  entities: Entity[]
  device_properties?: DeviceProperties
}

const ENTITY_ORBIT_RADIUS = 40

const badgeHoverClassName =
  'flex size-full cursor-default items-center justify-center rounded-full transition-transform duration-200 ease-out hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-component-text-light/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

const EntityBadge = ({ entities, device_properties }: EntityBadgeProps) => {
  const listEntities = (entities ?? []).filter((entity) => entity.icon)
  if (listEntities.length === 0) {
    return null
  }

  let body: React.ReactNode
  if (listEntities.length === 1) {
    const entity = listEntities[0]
    body = (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex size-12 items-center justify-center">
            <div className={badgeHoverClassName}>
              {renderEntityContent(entity)}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs border-none">
          {getEntityTooltipLabel(entity, device_properties)}
        </TooltipContent>
      </Tooltip>
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
              className="absolute flex items-center justify-center overflow-visible"
              style={{
                left: cx - BADGE_SIZE / 2,
                top: cy - BADGE_SIZE / 2,
                width: BADGE_SIZE,
                height: BADGE_SIZE,
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={badgeHoverClassName}>
                    {renderEntityContent(entity)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  {getEntityTooltipLabel(entity, device_properties)}
                </TooltipContent>
              </Tooltip>
            </div>
          )
        })}
      </div>
    )
  }

  return <TooltipProvider delayDuration={0}>{body}</TooltipProvider>
}

export default EntityBadge
