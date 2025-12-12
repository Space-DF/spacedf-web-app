import ExpandableList from '@/components/common/expandable-list'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'
import { useCallback, useMemo } from 'react'
import { useDeviceStore } from '@/stores/device-store'
import { useGetDevices } from '@/hooks/useDevices'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useGetAlert } from './hooks/useGetAlert'
import { useTripAddress } from '../trip-history/hooks/useTripAddress'
import { ChevronDown, Clock, Droplet, MapPin } from 'lucide-react'
import { Alert } from '@/types/alert'
import { useTranslations } from 'next-intl'

dayjs.extend(relativeTime)

const DATE_VALUES = [
  {
    label: 'Today',
    value: 'today',
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
  },
  {
    label: 'Last 7 days',
    value: 'last_7_days',
  },
  {
    label: 'Last 30 days',
    value: 'last_30_days',
  },
  {
    label: 'Last 90 days',
    value: 'last_90_days',
  },
]

interface ListItem {
  id: string
  title: string
  severity: 'critical' | 'warning'
  waterLevel: string
  location: string | React.ReactNode
  time: string
  timestamp: Date
  relativeTime: string
}

const INITIAL_VISIBLE_COUNT = 2

const getSeverity = (alert: Alert): 'critical' | 'warning' => {
  const name = alert.name.toLowerCase()
  if (name.includes('critical') || alert.water_level >= 90) {
    return 'critical'
  }
  return 'warning'
}

const getWaterLevelRange = (waterLevel: number): string => {
  // Determine water level range based on the value
  if (waterLevel >= 90) {
    return '2m - 3m'
  } else if (waterLevel >= 80) {
    return '1.5m - 2m'
  } else if (waterLevel >= 70) {
    return '1m - 1.5m'
  } else {
    return '0.5m - 1m'
  }
}

const AlertItemSkeleton = ({ isExpanded }: { isExpanded: boolean }) => {
  return (
    <div
      className={cn(
        'border border-brand-component-stroke-dark-soft rounded-md p-2 bg-brand-component-fill-light shadow-sm transition-all duration-200',
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}
    >
      <div className="flex items-start gap-x-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <div className="flex flex-col gap-y-3 flex-1">
          <div className="flex flex-col gap-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex items-center gap-x-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex items-center gap-x-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="w-[73px] h-[73px] rounded-md" />
      </div>
    </div>
  )
}

export default function ListAlert() {
  const { data: devices } = useGetDevices()
  const deviceSelected = useDeviceStore((state) => state.deviceSelected)

  const currentDeviceId = useMemo(() => {
    const currentDeviceSpace = devices?.find(
      (device) => device.id === deviceSelected
    )
    return currentDeviceSpace?.device.id
  }, [devices, deviceSelected])

  const { data: alerts = [], isLoading } = useGetAlert(currentDeviceId)
  const t = useTranslations('common')
  const listLocation = useMemo(() => {
    return alerts.map((alert) => ({
      longitude: alert.longitude,
      latitude: alert.latitude,
    }))
  }, [alerts])

  const { data: alertAddresses } = useTripAddress(listLocation)

  const alertList: ListItem[] = useMemo(
    () =>
      alerts?.map((alert, index) => {
        const severity = getSeverity(alert)
        const timestamp = new Date(alert.timestamp)
        const relativeTimeStr = dayjs(timestamp).fromNow(true)

        return {
          id: alert.id,
          title: alert.name,
          severity,
          waterLevel: getWaterLevelRange(alert.water_level),
          location: alertAddresses?.[index] || (
            <Skeleton className="w-20 h-4" />
          ),
          time: format(timestamp, 'hh:mm a'),
          timestamp,
          relativeTime: relativeTimeStr,
        }
      }) || [],
    [alerts, alertAddresses]
  )

  const renderAlertItem = useCallback(
    (item: ListItem, index: number, isExpanded: boolean) => {
      const isCritical = item.severity === 'critical'

      return (
        <div
          key={item.id}
          className={cn(
            'border border-brand-component-stroke-dark-soft rounded-md p-2 bg-brand-component-fill-light shadow-sm transition-all duration-200 relative',
            isExpanded
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4'
          )}
        >
          <div className="flex items-start gap-x-2">
            <div className="flex-shrink-0 mt-1">
              {isCritical ? (
                <div className="p-1 rounded-full bg-brand-component-fill-negative-soft flex items-center justify-center">
                  <Image
                    src="/images/warning-octagon.svg"
                    alt="warning octagon"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
              ) : (
                <div className="p-1 rounded-full bg-brand-component-fill-warning-soft flex items-center justify-center">
                  <Image
                    src="/images/warning.svg"
                    alt="warning octagon"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-y-3 flex-1 min-w-0">
              <div className="flex flex-col gap-y-1">
                <span className="text-brand-component-text-dark text-sm font-semibold line-clamp-1">
                  {item.title}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded w-fit',
                    isCritical
                      ? 'text-brand-component-text-negative bg-brand-component-fill-negative-soft border border-brand-component-stroke-negative'
                      : 'text-brand-component-text-warning border border-brand-component-stroke-warning bg-brand-component-fill-warning-soft'
                  )}
                >
                  {isCritical ? 'Critical' : 'Warning'}
                </span>
              </div>

              {/* Metadata */}
              <div className="flex flex-col gap-y-2">
                {/* Water Level */}
                <div className="flex items-center gap-x-2">
                  <Droplet className="w-4 h-4 text-brand-component-text-gray flex-shrink-0" />
                  <span className="text-xs text-brand-component-text-gray">
                    {item.waterLevel}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-x-2">
                  <MapPin className="w-4 h-4 text-brand-component-text-gray flex-shrink-0" />
                  <span className="text-xs text-brand-component-text-gray line-clamp-1">
                    {item.location}
                  </span>
                </div>
                <div className="flex items-center gap-x-2">
                  <Clock className="w-4 h-4 text-brand-component-text-gray flex-shrink-0" />
                  <span className="text-xs text-brand-component-text-gray">
                    {item.time}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Image
                src={
                  isCritical
                    ? '/images/flood-critical.png'
                    : '/images/flood-warning.png'
                }
                alt="flood illustration"
                width={56}
                height={50}
                quality={100}
              />
            </div>
          </div>
        </div>
      )
    },
    []
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-brand-component-text-dark text-sm font-semibold">
          {t('alerts')}
        </Label>
        <div className="flex items-center gap-2">
          <Select defaultValue="today">
            <SelectTrigger
              icon={<ChevronDown className="size-4" />}
              className="bg-brand-component-fill-dark-soft dark:bg-brand-component-fill-light rounded-lg border-none outline-none focus:ring-0 min-w-28 h-6"
            >
              <SelectValue placeholder="Select date" className="min-w-30 h-6" />
            </SelectTrigger>
            <SelectContent>
              {DATE_VALUES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: INITIAL_VISIBLE_COUNT }).map((_, index) => (
            <AlertItemSkeleton key={index} isExpanded />
          ))}
        </div>
      ) : (
        <>
          <ExpandableList
            items={alertList}
            initialCount={INITIAL_VISIBLE_COUNT}
            renderItem={renderAlertItem}
            expandMessage={t('all_alerts')}
            collapseMessage={t('less_alerts')}
          />
        </>
      )}
    </div>
  )
}
