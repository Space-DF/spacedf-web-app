'use client'

import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo } from 'react'
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

import { useRouter } from '@/i18n/routing'
import { useParams, useSearchParams } from 'next/navigation'
import { useGlobalStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { useGetSpaces } from '@/app/[locale]/[organization]/(withAuth)/spaces/hooks'
import { useDecodedToken } from '@/containers/identity/auth/hooks/useDecodedToken'
import { cn } from '@/lib/utils'

type SwitchSpaceProps = {
  isCollapsed?: boolean
}

const SwitchSpace = ({ isCollapsed }: SwitchSpaceProps) => {
  const t = useTranslations('space')
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setCurrentSpace } = useGlobalStore(useShallow((state) => state))
  const { data: spaces } = useGetSpaces()
  const spaceList = spaces?.data?.results || []

  const defaultSpace = useMemo(
    () => spaceList.find((space) => space.default_display) || spaceList.at(-1),
    [spaceList]
  )

  const token = searchParams.get('token')
  const { data: decodedToken, isLoading: isDecodedTokenLoading } =
    useDecodedToken(token)

  const handleGoToSpace = useCallback(
    async (spaceSlug: string) => {
      if (!params.spaceSlug || params.spaceSlug === spaceSlug) return
      router.replace(`/spaces/${spaceSlug}`)
    },
    [router, params.spaceSlug]
  )

  const spaceSelected = useMemo(() => {
    const currentSpace =
      spaceList.find(({ slug_name }) => slug_name === params.spaceSlug) ||
      defaultSpace
    return currentSpace
  }, [params.spaceSlug, spaceList, defaultSpace])

  useEffect(() => {
    if (spaceSelected && !token) {
      setCurrentSpace(spaceSelected)
      handleGoToSpace(spaceSelected.slug_name)
    }
  }, [spaceSelected, setCurrentSpace, handleGoToSpace, token])

  useEffect(() => {
    if (
      !params.spaceSlug &&
      defaultSpace &&
      !decodedToken &&
      !isDecodedTokenLoading &&
      !token
    ) {
      router.replace(`/spaces/${defaultSpace.slug_name}`)
    }
  }, [
    params.spaceSlug,
    spaceList,
    decodedToken,
    isDecodedTokenLoading,
    token,
    router,
    defaultSpace,
  ])

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
        handleGoToSpace(space.slug_name)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [spaceList, handleGoToSpace])

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
                handleGoToSpace(space.slug_name)
                // window.location.reload()
              }}
              className={cn(
                'cursor-pointer rounded-xl p-1 focus:bg-brand-fill-outermost',
                space.slug_name === params.spaceSlug &&
                  'bg-brand-fill-outermost'
              )}
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
