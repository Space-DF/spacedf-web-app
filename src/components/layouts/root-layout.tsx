'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SpaceDFLogoFull } from '@/components/icons'

export function RootUserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const t = useTranslations('organization')
  const pathname = usePathname()
  const navs = [
    {
      href: '/overview',
      key: 'overview',
      label: t('overview'),
    },
    {
      href: '/organization',
      key: 'organization',
      label: t('organization'),
    },
    {
      href: '/member',
      key: 'member',
      label: t('member'),
    },
  ]

  return (
    <>
      <header className="flex items-center justify-between px-10 py-6">
        <div>
          <SpaceDFLogoFull />
        </div>
        <nav>
          <ul className="flex rounded-full border border-brand-component-stroke-dark-soft">
            {navs.map((nav) => (
              <li key={nav.key}>
                <Link
                  href={nav.href}
                  className={cn('inline-block rounded-full px-5 py-3.5', {
                    'bg-brand-component-fill-dark text-brand-component-text-light':
                      pathname === nav.href,
                  })}
                >
                  {nav.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 rounded-full border border-brand-component-stroke-dark-soft p-2">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex h-full flex-col justify-between">
                <div className="text-sm text-brand-component-text-dark">
                  Digital Fortress
                </div>
                <div className="text-xs text-brand-typo-body-soft">
                  digitalfortress@gmail.com
                </div>
              </div>
              <div>
                <ChevronDown className="text-brand-icon-gray" size={20} />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="w-72 rounded-xl border-brand-stroke-outermost bg-brand-dark-bg-space p-3 text-white backdrop-blur-xl"
            sideOffset={3}
          >
            <DropdownMenuGroup className="mt-2 space-y-1">
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Billing
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main>{children}</main>
    </>
  )
}
