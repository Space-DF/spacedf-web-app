import { useMutation, useQueryClient } from '@tanstack/react-query'
import queryString from 'query-string'

import { useSpaceSlug } from '@/hooks'
import { queryKeys } from '@/lib/query-keys'
import { patchBuildingsListCache } from '@/templates/smart-building/hooks/useBuilding'
import type { Building } from '@/types/building'
import type { PaginationResponse } from '@/types/global'

export type SaveBuildingArg =
  | { mode: 'create'; model: File; name: string; floorName?: string }
  | { mode: 'edit'; buildingId: string; name: string; model?: File }

async function saveBuilding(
  spaceSlug: string,
  arg: SaveBuildingArg
): Promise<Building> {
  if (arg.mode === 'create') {
    const url = queryString.stringifyUrl({
      url: '/api/building',
      query: { spaceSlug },
    })
    const formData = new FormData()
    formData.set('model', arg.model)
    formData.set('name', arg.name)
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message ?? 'Failed to upload model')
    }
    return data as Building
  }

  const buildingUrl = queryString.stringifyUrl({
    url: `/api/building/${arg.buildingId}`,
    query: { spaceSlug },
  })

  if (arg.model) {
    const formData = new FormData()
    formData.set('model', arg.model)
    formData.set('name', arg.name)
    const response = await fetch(buildingUrl, {
      method: 'PUT',
      body: formData,
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message ?? 'Failed to update building')
    }
    return data as Building
  }

  const response = await fetch(buildingUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: arg.name }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to update building')
  }
  return data as Building
}

export function useUploadModel() {
  const queryClient = useQueryClient()
  const spaceSlugName = useSpaceSlug()

  return useMutation({
    mutationFn: (arg: SaveBuildingArg) => {
      if (!spaceSlugName) {
        throw new Error('Missing space slug')
      }
      return saveBuilding(spaceSlugName, arg)
    },
    onSuccess: (saved, arg) => {
      if (!spaceSlugName) return

      queryClient.setQueryData<PaginationResponse<Building>>(
        queryKeys.buildings.list(spaceSlugName),
        (current) =>
          patchBuildingsListCache(
            current,
            saved,
            arg.mode === 'create' ? 'create' : 'edit'
          )
      )
    },
  })
}
