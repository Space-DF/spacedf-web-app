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
import { format, subDays } from 'date-fns'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDeviceStore } from '@/stores/device-store'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useGetAlert } from './hooks/useGetAlert'
import { useTripAddress } from '../trip-history/hooks/useTripAddress'
import { ChevronDown, Clock, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { WaterDepthLevelName } from '@/utils/water-depth'
import { useShallow } from 'zustand/react/shallow'
import {
  CautionIcon,
  CriticalIcon,
  PeopleIllustration,
  WarningIcon,
  WaterLevelIllustration,
} from '@/components/icons/flood-level-illustration'
import { WATER_DEPTH_LEVEL_COLOR } from '@/constants'

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
  severity: WaterDepthLevelName
  waterLevel: string
  location: string | React.ReactNode
  time: string
  timestamp: Date
  relativeTime: string
}

const INITIAL_VISIBLE_COUNT = 2

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

const getDateByDateType = (dateType: string) => {
  const now = new Date()
  const dateTypeObj = {
    today: format(now, 'yyyy-MM-dd'),
    yesterday: format(subDays(now, 1), 'yyyy-MM-dd'),
    last_7_days: format(subDays(now, 7), 'yyyy-MM-dd'),
    last_30_days: format(subDays(now, 30), 'yyyy-MM-dd'),
    last_90_days: format(subDays(now, 90), 'yyyy-MM-dd'),
  }
  return (
    dateTypeObj[dateType as keyof typeof dateTypeObj] ||
    format(now, 'yyyy-MM-dd')
  )
}

const getWaterLevel = (value: number, unit: string) => {
  if (unit === 'cm') {
    return value / 100
  }
  return value
}

const waterLevelIcon = {
  critical: <CriticalIcon />,
  warning: <WarningIcon />,
  caution: <CautionIcon />,
}

export default function ListAlert() {
  const deviceSelected = useDeviceStore((state) => state.deviceSelected)
  const [selectedDate, setSelectedDate] = useState<string>('today')
  const {
    data: alerts,
    isLoading,
    isValidating,
  } = useGetAlert(
    deviceSelected,
    getDateByDateType(selectedDate),
    getDateByDateType('today')
  )
  const t = useTranslations('common')
  const deviceAlerts = useDeviceStore(
    useShallow((state) => state.deviceAlerts.water_depth[state.deviceSelected])
  )
  const setDeviceAlertDevice = useDeviceStore(
    useShallow((state) => state.setDeviceAlertDevice)
  )

  useEffect(() => {
    if (isValidating) return
    const newDeviceAlerts =
      deviceAlerts?.filter(
        (alert) =>
          format(alert.reported_at, 'yyyy-MM-dd') !==
          getDateByDateType(selectedDate)
      ) || []
    setDeviceAlertDevice(deviceSelected, 'water_depth', newDeviceAlerts)
  }, [isValidating])

  const listLocation: [number, number][] = useMemo(() => {
    return (
      alerts?.results?.map((alert) => [
        alert.location.longitude,
        alert.location.latitude,
      ]) || []
    )
  }, [alerts])

  const { data: alertAddresses } = useTripAddress(listLocation)

  const alertAvailableList = useMemo(() => {
    return (
      deviceAlerts?.filter(
        (alert) =>
          format(alert.reported_at, 'yyyy-MM-dd') ===
            getDateByDateType(selectedDate) && alert.level !== 'safe'
      ) || []
    )
  }, [deviceAlerts, selectedDate])

  const alertList: ListItem[] = useMemo(
    () =>
      [...alertAvailableList, ...(alerts?.results || [])].map(
        (alert, index) => {
          const timestamp = new Date(alert.reported_at)
          const relativeTimeStr = dayjs(timestamp).fromNow(true)

          return {
            id: alert.reported_at,
            title: alert.message,
            severity: alert.level,
            waterLevel: `${getWaterLevel(alert.water_depth, alert.unit)} m`,
            location:
              alertAddresses?.[index]?.features?.[0]?.place_name ||
              ((<Skeleton className="w-20 h-4" />) as React.ReactNode),
            time: format(timestamp, 'hh:mm a'),
            timestamp,
            relativeTime: relativeTimeStr,
          }
        }
      ) || [],
    [alerts, alertAddresses, alertAvailableList]
  )

  const renderAlertItem = useCallback(
    (item: ListItem, _: number, isExpanded: boolean) => {
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
              <div
                className="p-1 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    WATER_DEPTH_LEVEL_COLOR[item.severity].secondary,
                }}
                key={item.severity}
              >
                {waterLevelIcon[item.severity as keyof typeof waterLevelIcon]}
              </div>
            </div>

            <div className="flex flex-col gap-y-3 flex-1 min-w-0">
              <div className="flex flex-col gap-y-1">
                <span className="text-brand-component-text-dark text-sm font-semibold line-clamp-1">
                  {item.title}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded w-fit capitalize'
                  )}
                  style={{
                    backgroundColor:
                      WATER_DEPTH_LEVEL_COLOR[item.severity].secondary,
                    color: WATER_DEPTH_LEVEL_COLOR[item.severity].primary,
                    borderColor: WATER_DEPTH_LEVEL_COLOR[item.severity].primary,
                    borderWidth: '1px',
                  }}
                >
                  {item.severity}
                </span>
              </div>

              {/* Metadata */}
              <div className="flex flex-col gap-y-2">
                {/* Water Level */}
                <div className="flex items-center gap-x-2">
                  <Image
                    src="/images/flood-level.svg"
                    alt="water level"
                    width={16}
                    height={10}
                    quality={100}
                    className="w-3 text-brand-component-text-gray flex-shrink-0"
                  />
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
            <div className="flex-shrink-0 relative flex">
              <span className="text-[8px] text-brand-text-gray translate-y-1">
                2m
              </span>
              <WaterLevelIllustration
                level={item.severity}
                className="relative z-[9]"
              />

              <PeopleIllustration className="absolute bottom-0 right-4 z-0" />
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
          <Select defaultValue="today" onValueChange={setSelectedDate}>
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
