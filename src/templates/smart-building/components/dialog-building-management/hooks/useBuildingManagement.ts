import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

type UpdateBuildingArg = {
  name: string
}

const updateBuildingFetcher = async (
  url: string,
  { arg }: { arg: UpdateBuildingArg }
) => {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message ?? 'Failed to update building')
  return data
}

export const useUpdateBuilding = (buildingId: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(
    `/api/building/${buildingId}?spaceSlug=${spaceSlug}`,
    updateBuildingFetcher
  )
}

type AddFloorArg = {
  model: File
  name: string
  level: number
}

const addFloorFetcher = async (url: string, { arg }: { arg: AddFloorArg }) => {
  const formData = new FormData()
  formData.set('model', arg.model)
  formData.set('name', arg.name)
  formData.set('level', String(arg.level))
  const response = await fetch(url, { method: 'POST', body: formData })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message ?? 'Failed to add floor')
  return data
}

export const useAddFloor = (buildingId: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(
    `/api/building/${buildingId}/floor?spaceSlug=${spaceSlug}`,
    addFloorFetcher
  )
}

type UpdateFloorArg = {
  name: string
  level: number
  model?: File
}

const updateFloorFetcher = async (
  url: string,
  { arg }: { arg: UpdateFloorArg }
) => {
  let response: Response
  if (arg.model) {
    const formData = new FormData()
    formData.set('name', arg.name)
    formData.set('level', String(arg.level))
    formData.set('model', arg.model)
    response = await fetch(url, { method: 'PATCH', body: formData })
  } else {
    response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: arg.name, level: arg.level }),
    })
  }
  const data = await response.json()
  if (!response.ok) throw new Error(data.message ?? 'Failed to update floor')
  return data
}

export const useUpdateFloor = (floorId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(
    floorId ? `/api/floor/${floorId}?spaceSlug=${spaceSlug}` : null,
    updateFloorFetcher
  )
}

const deleteFloorFetcher = async (url: string) => {
  const response = await fetch(url, { method: 'DELETE' })
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message ?? 'Failed to delete floor')
  }
  return { success: true }
}

export const useDeleteFloor = (floorId?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(
    floorId ? `/api/floor/${floorId}?spaceSlug=${spaceSlug}` : null,
    deleteFloorFetcher
  )
}

type UpdateAreaArg = {
  name: string
  model?: File
}

const updateAreaFetcher = async (
  url: string,
  { arg }: { arg: UpdateAreaArg }
) => {
  let response: Response
  if (arg.model) {
    const formData = new FormData()
    formData.set('name', arg.name)
    formData.set('model', arg.model)
    response = await fetch(url, { method: 'PATCH', body: formData })
  } else {
    response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: arg.name }),
    })
  }
  const data = await response.json()
  if (!response.ok) throw new Error(data.message ?? 'Failed to update area')
  return data
}

export const useUpdateArea = (areaId: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(
    areaId ? `/api/area/${areaId}?spaceSlug=${spaceSlug}` : null,
    updateAreaFetcher
  )
}
