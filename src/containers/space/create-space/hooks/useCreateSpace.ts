import { UseGetSpaceResponse } from '@/app/[locale]/[organization]/(dev-protected)/(withAuth)/spaces/hooks/useGetSpaces'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { Space } from '@/types/space'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const createSpace = async (
  arg: Partial<Omit<Space, 'logo'> & { logo: File }>
) => {
  const formData = new FormData()
  if (arg.logo) {
    formData.append('logo', arg.logo)
  }
  formData.append('name', arg.name as string)
  formData.append('slug_name', arg.slug_name as string)
  return api.post<Space>('/api/spaces', formData)
}

export const useCreateSpace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSpace,
    onSuccess: (createdSpace) => {
      queryClient.setQueryData<UseGetSpaceResponse>(
        queryKeys.spaces.list(),
        (currentData) => {
          const results = currentData?.data?.results ?? []
          const nextResults = [...results, createdSpace]

          return {
            ...currentData,
            status: currentData?.status ?? 200,
            data: {
              ...currentData?.data,
              count: nextResults.length,
              results: nextResults,
            },
          }
        }
      )
    },
  })
}
