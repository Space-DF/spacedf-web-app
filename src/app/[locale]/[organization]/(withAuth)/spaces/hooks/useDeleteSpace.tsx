import useSWRMutation from 'swr/mutation'
import { SWR_GET_SPACE_ENDPOINT, UseGetSpaceResponse } from './useGetSpaces'
import { ApiErrorResponse } from '@/types/global'
import { toast } from 'sonner'

type UseDeleteSpaceParams = {
  slug_name: string
  name: string
}

export async function deleteSpace(
  url: string,
  { arg }: { arg: UseDeleteSpaceParams },
) {
  const response = await fetch(`${url}/${arg.slug_name}`, {
    method: 'DELETE',
    body: JSON.stringify({ slug_name: arg.slug_name }),
  })
  const data = await response.json()
  if (!response.ok) {
    const errorData: ApiErrorResponse = data
    throw new Error(errorData.detail || 'Some things went wrong')
  }
  return arg
}

export const useDeleteSpace = () => {
  return useSWRMutation(SWR_GET_SPACE_ENDPOINT, deleteSpace, {
    optimisticData: (
      currentData?: UseGetSpaceResponse | undefined,
    ): UseGetSpaceResponse => {
      return currentData as UseGetSpaceResponse
    },
    populateCache: (result, currentData) => {
      const newSpaces = (currentData?.data?.results || []).filter(
        (space) => space.slug_name !== result.slug_name,
      )
      return {
        ...currentData,
        data: {
          ...currentData?.data,
          count: newSpaces.length,
          results: newSpaces,
        },
      } as UseGetSpaceResponse
    },
    onSuccess: (data) => {
      toast.success(`Space ${data.name} deleted successfully`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
    rollbackOnError: true,
    revalidate: false,
  })
}
