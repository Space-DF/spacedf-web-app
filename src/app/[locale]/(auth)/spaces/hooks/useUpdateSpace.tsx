import { Space } from '@/types/space'
import useSWRMutation from 'swr/mutation'
import { UseGetSpaceResponse, useGetSpaces } from './useGetSpaces'
import { ApiErrorResponse } from '@/types/global'
import { toast } from 'sonner'

type UseUpdateSpaceParams = {
  spaceId: number
  dataUpdate: Partial<Space>
  slug_name: string
}

export async function updateSpace(
  url: string,
  {
    arg,
  }: {
    arg: UseUpdateSpaceParams
  },
) {
  const response = await fetch(`${url}?slug_name=${arg.slug_name}`, {
    method: 'PATCH',
    body: JSON.stringify(arg.dataUpdate),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(errorData.detail || 'Some things went wrong')
  }

  return response.json()
}

export const useUpdateSpace = () => {
  const { trigger } = useSWRMutation('/api/spaces', updateSpace, {
    rollbackOnError: true,
    revalidate: false,
  })

  const updateSpaceTrigger = async (params: UseUpdateSpaceParams) => {
    await trigger(params, {
      optimisticData: (prevData) => {
        console.log('Previous Data:', prevData)
        const newSpaces = (prevData as UseGetSpaceResponse).data?.results?.map(
          (space) => {
            if (space.slug_name === params.slug_name) {
              return {
                ...space,
                ...params.dataUpdate,
              }
            }

            return space
          },
        )

        return {
          ...prevData,
          data: {
            ...(prevData?.data || {}),
            results: newSpaces,
          },
        }
      },
      onSuccess: () => {
        toast.success(`Space ${params.slug_name} updated successfully`)
      },
      onError: (error) => {
        console.log(error)
        toast.error(error.message)
      },
      rollbackOnError: true,
      revalidate: false,
    })
  }

  return { updateSpaceTrigger }
}
