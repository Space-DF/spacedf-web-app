import { ArrowUpRight, ChevronsUpDown, PlusIcon } from 'lucide-react'
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

const dashboards = [
  {
    value: 'next.js',
    label: 'Dashboard 1',
  },
  {
    value: 'sveltekit',
    label: 'Dashboard 2',
  },
  {
    value: 'nuxt.js',
    label: 'Dashboard 3',
  },
  {
    value: 'remix',
    label: 'Dashboard 4',
  },
  {
    value: 'astro',
    label: 'Dashboard 5',
  },
]

const Widgets = () => {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout),
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

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
              {value
                ? dashboards.find((dashboard) => dashboard.value === value)
                    ?.label
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
                        setValue(currentValue === value ? '' : currentValue)
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
                <Button className="h-8 w-full gap-2 rounded-lg text-sm font-semibold">
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
          <PlusIcon />
        </Button>
      }
    >
      <div className="flex gap-3">
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
