import { queryKeys } from '@/lib/query-keys'
import { SWR_GET_SPACE_ENDPOINT, UseGetSpaceResponse } from './useGetSpaces'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type UseDeleteSpaceParams = {
  slug_name: string
  name: string
}

export const useDeleteSpace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ slug_name }: UseDeleteSpaceParams) => {
      await api.delete(`${SWR_GET_SPACE_ENDPOINT}/${slug_name}`)
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<UseGetSpaceResponse>(
        queryKeys.spaces.list(),
        (currentData) => {
          if (!currentData?.data?.results) return currentData
          const newSpaces = currentData.data.results.filter(
            (space) => space.slug_name !== variables.slug_name
          )
          return {
            ...currentData,
            data: {
              ...currentData.data,
              count: newSpaces.length,
              results: newSpaces,
            },
          }
        }
      )
      queryClient.invalidateQueries({
        queryKey: queryKeys.spaces.detail(variables.slug_name),
      })
      toast.success(`Space ${variables.name} deleted successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
