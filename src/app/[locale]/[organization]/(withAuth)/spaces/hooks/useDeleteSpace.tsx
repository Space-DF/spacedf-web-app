import useSWRMutation from 'swr/mutation'
import { SWR_GET_SPACE_ENDPOINT, UseGetSpaceResponse } from './useGetSpaces'
import { toast } from 'sonner'
import api from '@/lib/api'

type UseDeleteSpaceParams = {
  slug_name: string
  name: string
}

export async function deleteSpace(
  url: string,
  { arg }: { arg: UseDeleteSpaceParams }
) {
  await api.delete(`${url}/${arg.slug_name}`)
  return arg
}

export const useDeleteSpace = () => {
  return useSWRMutation(SWR_GET_SPACE_ENDPOINT, deleteSpace, {
    optimisticData: (
      currentData?: UseGetSpaceResponse
    ): UseGetSpaceResponse => {
      return currentData as UseGetSpaceResponse
    },
    populateCache: (result, currentData) => {
      const newSpaces = (currentData?.data?.results || []).filter(
        (space) => space.slug_name !== result.slug_name
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
