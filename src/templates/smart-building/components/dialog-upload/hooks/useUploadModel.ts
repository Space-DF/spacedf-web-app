import { useGlobalStore } from '@/stores'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const uploadModelFetcher = async (url: string, { arg }: { arg: UploadArg }) => {
  const formData = new FormData()
  const { model, name, floorName } = arg
  formData.set('model', model)
  formData.set('name', name)
  if (floorName) {
    formData.set('floorName', floorName)
  }
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to upload model')
  }
  return data
}

export type UploadModelResult = {
  build_artifact: string
}

type UploadArg = {
  model: File
  name: string
  floorName?: string
}

export const useUploadModel = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name
  return useSWRMutation<UploadModelResult, Error, string | null, UploadArg>(
    spaceSlugName ? `/api/building?spaceSlug=${spaceSlugName}` : null,
    uploadModelFetcher
  )
}
