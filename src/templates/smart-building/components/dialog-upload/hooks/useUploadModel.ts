import { useGlobalStore } from '@/stores'
import type { Building } from '@/types/building'
import { useParams } from 'next/navigation'
import queryString from 'query-string'
import useSWRMutation from 'swr/mutation'

export type SaveBuildingArg =
  | { mode: 'create'; model: File; name: string; floorName?: string }
  | { mode: 'edit'; buildingId: string; name: string; model?: File }

function getSpaceSlugFromMutationKey(url: string): string | null {
  const { query } = queryString.parseUrl(url)
  const slug = query.spaceSlug
  return typeof slug === 'string' ? slug : null
}

async function saveBuildingFetcher(
  url: string,
  { arg }: { arg: SaveBuildingArg }
): Promise<Building> {
  const spaceSlug = getSpaceSlugFromMutationKey(url)
  if (!spaceSlug) {
    throw new Error('Missing space slug')
  }

  if (arg.mode === 'create') {
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
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name

  return useSWRMutation<Building, Error, string | null, SaveBuildingArg>(
    spaceSlugName
      ? queryString.stringifyUrl({
          url: '/api/building',
          query: { spaceSlug: spaceSlugName },
        })
      : null,
    saveBuildingFetcher
  )
}
