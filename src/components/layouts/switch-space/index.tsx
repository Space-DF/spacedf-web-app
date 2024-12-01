/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import AddNewSpace from './add-new-space'
import Space from './space'
import SpaceMenuItem from './space-menu-item'
import { useGetSpaces } from '@/app/[locale]/(auth)/spaces/hooks'
import { useRouter } from '@/i18n/routing'
import { useParams } from 'next/navigation'

type SwitchSpaceProps = {
  isCollapsed?: boolean
}

const SwitchSpace = ({ isCollapsed }: SwitchSpaceProps) => {
  const t = useTranslations('space')
  const params = useParams()
  const router = useRouter()
  const { data: spaces } = useGetSpaces()
  const spaceList = spaces?.data?.results || []
  const spaceSelected =
    spaceList.find(({ id }) => id === params.spaceId) || spaceList[0]

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const { code, metaKey, altKey } = event
      const numberFromCode = code?.[code?.length - 1]

      const isDetectShortCut =
        Number(numberFromCode) < 10 &&
        Number(numberFromCode) <= spaceList.length

      if (!isDetectShortCut) return

      if (metaKey && altKey) {
        const space = spaceList[Number(numberFromCode) - 1]
        handleGoToSpace(space.id)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [spaceList])

  const handleGoToSpace = useCallback((spaceId: string) => {
    router.push(`/spaces/${spaceId}`)
  }, [])

  const customMatchKeys = useCallback(
    (keys: string[], event: KeyboardEvent) => {
      const { code, metaKey, altKey } = event

      const numberFromCode = code[code.length - 1]

      const expectedKeys = keys.map((k) => k.toLowerCase())
      const currentKeys = [numberFromCode.toLowerCase()]

      if (metaKey) currentKeys.push('meta')
      if (altKey) currentKeys.push('alt')

      return expectedKeys.every((k) => currentKeys.includes(k))
    },
    [],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Space
            spaceData={spaceSelected}
            isSelected
            hiddenOption={isCollapsed}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="w-72 rounded-xl border-brand-stroke-outermost bg-brand-dark-bg-space p-3 text-white backdrop-blur-xl"
        sideOffset={3}
      >
        <DropdownMenuLabel className="p-0 text-xs font-semibold leading-normal">
          {t('switch_space')}
        </DropdownMenuLabel>

        <DropdownMenuGroup className="mt-2 space-y-1">
          {spaceList.map((space, index) => (
            <DropdownMenuItem
              key={space.id}
              onClick={() => {
                handleGoToSpace(space.id)
              }}
              className="cursor-pointer rounded-xl p-1 focus:bg-brand-fill-outermost"
            >
              <SpaceMenuItem spaceData={space} position={index} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <Separator className="my-2 bg-brand-stroke-outermost dark:bg-brand-stroke-outermost" />

        <DropdownMenuItem className="p-0 focus:bg-transparent">
          <AddNewSpace />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SwitchSpace
