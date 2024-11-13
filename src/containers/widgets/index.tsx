import { ArrowUpRight, ChevronsUpDown, Pencil, PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { DashboardTotalDevices } from '@/components/icons/dashboard-total-devices'
import { DashboardTotalMembers } from '@/components/icons/dashboard-total-members'
import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Nodata } from '@/components/ui/no-data'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useLayout } from '@/stores'

interface Dashboard {
  value: string
  label: string
  isDefault: boolean
}

let dashboards: Dashboard[] = [
  {
    value: 'next.js',
    label: 'SpaceDF IoT Dashboard',
    isDefault: true,
  },
  {
    value: 'sveltekit',
    label: 'Dashboard 2',
    isDefault: false,
  },
  {
    value: 'nuxt.js',
    label: 'Dashboard 3',
    isDefault: false,
  },
  {
    value: 'remix',
    label: 'Dashboard 4',
    isDefault: false,
  },
  {
    value: 'astro',
    label: 'Dashboard 5',
    isDefault: false,
  },
]

const Widgets = () => {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Dashboard>(dashboards[0])

  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout),
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  const handleCreateNewDashBoard = () => {
    setOpen(false)
    const value = {
      value: 'new-dashboard',
      label: 'Unnamed Dashboard',
      isDefault: false,
    }
    dashboards = [value, ...dashboards]
    setSelected(value)
  }

  return (
    <RightSideBarLayout
      onClose={() => {
        setCookieDirty(true)
        toggleDynamicLayout('dashboard')
      }}
      title={
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-8 justify-between gap-0 bg-brand-fill-dark-soft px-2 py-1 text-brand-text-dark"
            >
              {selected
                ? dashboards.find(
                    (dashboard) => dashboard.value === selected.value,
                  )?.label
                : 'Dashboard 1'}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 rounded-lg p-2" align="start">
            <Command>
              <CommandInput
                classNameContainer="border-0 rounded-lg bg-brand-fill-dark-soft"
                placeholder={t('dashboard.search')}
              />
              <CommandList>
                <CommandEmpty>{t('dashboard.no_dashboard_found')}</CommandEmpty>
                <CommandGroup className="mt-3 p-0">
                  {dashboards.map((dashboard) => (
                    <CommandItem
                      key={dashboard.value}
                      value={dashboard.value}
                      onSelect={(currentValue) => {
                        const itemSelect = dashboards.find(
                          (dashboard) => dashboard.value === currentValue,
                        )
                        setSelected(itemSelect!)
                        setOpen(false)
                      }}
                      className="rounded-md data-[selected=true]:bg-brand-fill-dark-soft"
                    >
                      {dashboard.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator className="my-3" />
                <Button
                  className="mb-3 h-8 w-full gap-2 rounded-lg text-sm font-semibold text-brand-text-gray"
                  variant="outline"
                >
                  {t('dashboard.view_all_dashboard')}
                  <ArrowUpRight />
                </Button>
                <Button
                  className="h-8 w-full gap-2 rounded-lg text-sm font-semibold"
                  onClick={handleCreateNewDashBoard}
                >
                  {t('dashboard.create_new_dashboard')}
                  <PlusIcon size={16} />
                </Button>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      }
      externalButton={
        <Button size="icon" className="size-8 gap-2 rounded-lg">
          <Pencil size={16} />
        </Button>
      }
    >
      <div className="flex gap-3">
        {selected.isDefault && (
          <>
            <DashboardInfo
              icon={<DashboardTotalDevices className="size-10" />}
              title={t('dashboard.total_devices')}
              content="N/A"
            />
            <DashboardInfo
              icon={<DashboardTotalMembers className="size-10" />}
              title={t('dashboard.total_members')}
              content="30"
            />
          </>
        )}
      </div>
      <Nodata content={t('common.nodata', { module: t('common.widget') })} />
    </RightSideBarLayout>
  )
}

const DashboardInfo = (props: {
  icon: React.ReactNode
  title: string
  content: string | number
}) => {
  const { icon, content, title } = props
  return (
    <div className="flex flex-1 gap-2 rounded-lg bg-white p-2">
      <div>{icon}</div>
      <div className="font-semibold text-brand-text-dark">
        <div className="text-xs">{title}</div>
        <div>{content}</div>
      </div>
    </div>
  )
}

export default memo(Widgets)
