import { Space } from '@/types/space'
import useSWRMutation from 'swr/mutation'
import { UseGetSpaceResponse, useGetSpaces } from './useGetSpaces'
import { ApiErrorResponse } from '@/types/global'
import { toast } from 'sonner'

type UseDeleteSpaceParams = {
  slug_name: string
}

export async function deleteSpaceFn(
  url: string,
  {
    arg,
  }: {
    arg: UseDeleteSpaceParams
  },
) {
  const response = await fetch(`${url}?slug_name=${arg.slug_name}`, {
    method: 'DELETE',
    body: JSON.stringify(arg.slug_name),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(errorData.detail || 'Some things went wrong')
  }

  return response.json()
}

export const useDeleteSpace = () => {
  const { trigger } = useSWRMutation('/api/spaces', deleteSpaceFn, {
    rollbackOnError: true,
    revalidate: false,
  })

  const deleteSpaceTrigger = async (params: UseDeleteSpaceParams) => {
    await trigger(params, {
      optimisticData: (prevData): UseGetSpaceResponse => {
        const newSpaces = (
          prevData as UseGetSpaceResponse
        ).data?.results?.filter((space) => space.slug_name !== params.slug_name)

        return {
          ...prevData,
          data: {
            count: (prevData?.data?.count || 0) - 1,
            ...(prevData?.data || {}),
            results: newSpaces,
          },
        }
      },
      onSuccess: () => {
        toast.success(`Space ${params.slug_name} deleted successfully`)
      },
      onError: (error) => {
        toast.error(error.message)
      },
      rollbackOnError: true,
      revalidate: false,
    })
  }

  return { deleteSpaceTrigger }
}
