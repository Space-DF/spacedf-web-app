'use client'
import deviceIcon from '/public/images/device.svg'
import inventoryIcon from '/public/images/inventory.svg'
import { SidebarCollapsedSimple, SidebarSimpleIcon } from '@/components/icons'
import SidebarItem from './sidebar-item'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const menuItems = (id: string) => [
  {
    label: 'Device',
    href: `/organizations/${id}/devices`,
    icon: deviceIcon,
    quantity: 39,
  },
  {
    label: 'Inventory',
    href: `/organizations/${id}/inventories`,
    icon: inventoryIcon,
    quantity: 8,
  },
]

interface Props {
  id: string
  isOpen: boolean
}

const OrganizationSidebar = ({ id, isOpen }: Props) => {
  const [open, setOpen] = useState(isOpen)
  return (
    <Sidebar collapsible="icon">
      <div className="h-full border-r border-brand-component-stroke-dark-soft flex flex-col overflow-y-auto bg-background shadow-sm">
        <div className="mx-5 pt-5 pb-3 border-b border-brand-component-stroke-dark-soft">
          <div
            className={cn(
              'flex items-center',
              open ? 'space-x-3' : 'space-y-3 flex-col'
            )}
          >
            <div
              className={cn(
                'flex items-center space-x-2 border rounded-xl border-brand-component-stroke-dark-soft p-1 font-semibold',
                open && 'pr-4'
              )}
            >
              <div className="bg-brand-component-fill-secondary-soft p-3 text-brand-component-text-secondary rounded-lg">
                DF
              </div>
              {open && (
                <p className="text-xs text-brand-heading leading-tight">
                  Digital Fortress
                </p>
              )}
            </div>
            <SidebarTrigger
              onClick={() => setOpen((prev) => !prev)}
              icon={
                open ? (
                  <SidebarSimpleIcon className="cursor-pointer justify-self-end text-brand-text-gray" />
                ) : (
                  <SidebarCollapsedSimple className="col-span-1 cursor-pointer justify-self-end text-brand-text-gray" />
                )
              }
            />
          </div>
        </div>
        <SidebarContent>
          <div className="flex flex-col w-full px-2">
            <SidebarGroup>
              <SidebarMenu className="flex flex-col w-full space-y-1 mt-4  overflow-hidden">
                {menuItems(id).map((menu) => (
                  <SidebarItem open={open} menu={menu} key={menu.href} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  )
}

export default OrganizationSidebar
