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
import Space from './space'
import SpaceMenuItem from './space-menu-item'
import { useRouter } from '@/i18n/routing'
import { useParams, useSearchParams } from 'next/navigation'
import { useGlobalStore, useOrganizationValidationStore } from '@/stores'
import { useGetSpaces } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/spaces/hooks'
import { useDecodedToken } from '@/containers/identity/auth/hooks/useDecodedToken'
import { cn } from '@/lib/utils'
import { useIdentityStore } from '@/stores/identity-store'
import AddNewSpace from './add-new-space'
import { MAX_LIMIT_SPACE_FREE } from '@/constants'

type SwitchSpaceProps = {
  isCollapsed?: boolean
}

const SwitchSpace = ({ isCollapsed }: SwitchSpaceProps) => {
  const t = useTranslations('space')
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const setCurrentSpace = useGlobalStore((state) => state.setCurrentSpace)
  const { data: spaces } = useGetSpaces()
  const isPro = useOrganizationValidationStore((state) => state.isPro)
  const spaceList = spaces?.data?.results || []

  const defaultSpace = useMemo(
    () => spaceList.find((space) => space.default_display) || spaceList.at(-1),
    [spaceList]
  )

  const openGuideline = useIdentityStore((state) => state.openGuideline)

  const token = searchParams.get('token')
  const { data: decodedToken, isLoading: isDecodedTokenLoading } =
    useDecodedToken(token)

  const handleGoToSpace = useCallback(
    async (spaceSlug: string) => {
      if (!params.spaceSlug || params.spaceSlug === spaceSlug) return
      router.push(`/spaces/${spaceSlug}`)
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
  }, [spaceSelected, handleGoToSpace, token])

  useEffect(() => {
    if (
      !params.spaceSlug &&
      defaultSpace &&
      !decodedToken &&
      !isDecodedTokenLoading &&
      !token &&
      !openGuideline
    ) {
      router.push(`/spaces/${defaultSpace.slug_name}`)
    }
  }, [
    params.spaceSlug,
    spaceList,
    decodedToken,
    isDecodedTokenLoading,
    token,
    router,
    defaultSpace,
    openGuideline,
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

  const disabled = !isPro && spaceList.length >= MAX_LIMIT_SPACE_FREE

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
        className="w-72 rounded-xl border-border bg-popover p-3 text-popover-foreground shadow-[0px_8px_10px_0px_rgba(0,0,0,0.06)]"
        sideOffset={3}
      >
        <div className="flex items-center justify-between">
          <DropdownMenuLabel className="px-1.5 py-1 text-xs font-medium leading-[18px] text-muted-foreground">
            {t('space_list')}
          </DropdownMenuLabel>
        </div>

        <DropdownMenuGroup className="mt-2 space-y-1">
          {spaceList.map((space, index) => (
            <DropdownMenuItem
              key={space.id}
              onClick={() => {
                if (space.is_deactivated) return
                handleGoToSpace(space.slug_name)
              }}
              className={cn(
                'cursor-pointer rounded-xl p-1 focus:bg-accent',
                space.slug_name === params.spaceSlug && 'bg-accent'
              )}
            >
              <SpaceMenuItem spaceData={space} position={index} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <Separator className="my-2 bg-border" />

        <DropdownMenuItem className="p-0 focus:bg-transparent">
          <AddNewSpace disabled={disabled} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SwitchSpace
