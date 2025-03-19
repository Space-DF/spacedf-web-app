'use client'
import { SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface Props {
  menu: {
    label: string
    href: string
    icon: string
    quantity: number
  }
  open: boolean
}

const SidebarItem: React.FC<Props> = ({ menu, open }) => {
  const pathName = usePathname()
  const isFocus = pathName.includes(menu.href)
  return (
    <SidebarMenuItem>
      <Link
        key={menu.label}
        href={menu.href}
        className={cn(
          'flex items-center gap-x-2 text-brand-component-text-gray text-sm font-[500] p-2 transition-all rounded-md group mx-2 hover:bg-brand-component-fill-dark-soft duration-150',
          isFocus && 'bg-brand-component-fill-dark-soft'
        )}
      >
        <div
          className={cn(
            'flex  justify-center items-center w-full',
            open && 'justify-between'
          )}
        >
          <div className="flex items-center gap-x-2">
            <Image
              src={menu.icon}
              width={20}
              height={20}
              alt="sidebar-icon"
              className={cn(
                'group-hover:text-brand-component-text-dark',
                isFocus && 'text-brand-component-text-dark'
              )}
            />
            {open && (
              <span
                className={cn(
                  'group-hover:text-brand-component-text-dark',
                  isFocus && 'text-brand-component-text-dark'
                )}
              >
                {menu.label}
              </span>
            )}
          </div>
          {open && (
            <div className="text-white font-semibold p-1 py-px bg-brand-component-fill-secondary rounded-[2px]">
              {menu.quantity > 10 ? menu.quantity : `0${menu.quantity}`}
            </div>
          )}
        </div>
      </Link>
    </SidebarMenuItem>
  )
}

export default SidebarItem
