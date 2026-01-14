import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Ellipsis, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Pen from '@/components/icons/pen'
import { Trash2 } from '@/components/icons/trash2'
import { useCallback, useState } from 'react'
import ExpandableList from '@/components/common/expandable-list'
import AddGeofence from './components/add-geofence'
import { useShowDummyData } from '@/hooks/useShowDummyData'

interface ListItem {
  id: number
  name: string
  createdAt: Date
  location: string
}

const LIST_GEOFENCES: ListItem[] = [
  {
    id: 1,
    name: 'Main Office',
    createdAt: new Date('2024-01-15'),
    location: '123 Business Park',
  },
  {
    id: 2,
    name: 'Warehouse Zone',
    createdAt: new Date('2024-02-01'),
    location: '456 Industrial Ave',
  },
  {
    id: 3,
    name: 'Customer Site A',
    createdAt: new Date('2024-02-15'),
    location: '789 Market St',
  },
  {
    id: 4,
    name: 'Service Center',
    createdAt: new Date('2024-03-01'),
    location: '321 Tech Blvd',
  },
  {
    id: 5,
    name: 'Remote Office',
    createdAt: new Date('2024-03-15'),
    location: '555 Remote Lane',
  },
]

const GEO_FENCE_ACTIONS = [
  {
    id: 1,
    name: 'Edit',
    icon: <Pen className="size-4" />,
  },
  {
    id: 2,
    name: 'Delete',
    icon: <Trash2 className="size-4" />,
  },
]

const INITIAL_VISIBLE_COUNT = 2

const ListGeofences = () => {
  const t = useTranslations('common')
  const [isAddGeofence, setIsAddGeofence] = useState(false)

  const showDummyData = useShowDummyData()

  const listGeofences = showDummyData ? LIST_GEOFENCES : []

  const renderGeofenceItem = useCallback(
    (item: ListItem, index: number, isExpanded: boolean) => {
      return (
        <div
          key={item.id}
          className={cn(
            'flex justify-between p-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-brand-component-fill-light border border-brand-component-stroke-dark-soft',
            isExpanded
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4'
          )}
        >
          <div className="flex items-center space-x-2">
            <Image
              src={'/images/map.svg'}
              alt="map-pin"
              width={60}
              height={60}
              className="rounded-md"
            />
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium text-brand-component-text-dark">
                {item.name}
              </div>
              <div className="text-xs text-brand-component-text-secondary font-semibold bg-brand-component-fill-secondary-soft px-2 rounded-sm border border-brand-component-stroke-secondary-soft">
                {item.location}
              </div>
              <div className="text-xs text-brand-component-text-gray">
                {t('created')}: {format(item.createdAt, 'dd/MM/yyyy')}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Ellipsis size={18} className="text-brand-component-text-gray" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {GEO_FENCE_ACTIONS.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="space-x-1 flex items-center cursor-pointer text-brand-component-text-gray hover:text-brand-component-text-dark"
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    []
  )

  return (
    <>
      <AddGeofence
        isOpen={isAddGeofence}
        onClose={() => setIsAddGeofence(false)}
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-brand-component-text-dark text-sm font-semibold">
            {t('geofences')}
          </Label>
          <Button
            className="flex items-center space-x-2 py-1 px-2 h-auto border-brand-component-stroke-dark  dark:border-brand-component-stroke-light border-[2px]"
            onClick={() => setIsAddGeofence(true)}
          >
            <span className="text-xs">{t('add_geofence')}</span>{' '}
            <Plus size={16} />
          </Button>
        </div>
        <ExpandableList
          items={listGeofences}
          initialCount={INITIAL_VISIBLE_COUNT}
          renderItem={renderGeofenceItem}
        />
      </div>
    </>
  )
}

export default ListGeofences
