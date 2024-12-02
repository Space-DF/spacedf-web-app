import useSWRMutation from 'swr/mutation'
import {
  SWR_GET_SPACE_ENDPOINT,
  UseGetSpaceResponse,
  useGetSpaces,
} from './useGetSpaces'
import { Space } from '@/types/space'
import { ApiErrorResponse } from '@/types/global'
import { toast } from 'sonner'
import { SWRConfiguration } from 'swr'

export async function createSpace(
  url: string,
  { arg }: { arg: Partial<Space> },
) {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to update space')
  }

  return response.json()
}

export const useCreateSpace = (configs?: SWRConfiguration) => {
  // const { mutate } = useGetSpaces()
  //
  // const { trigger } = useSWRMutation('/api/spaces', createSpace, {
  //   onSuccess(newSpace) {
  //     mutate((prevData: UseGetSpaceResponse): UseGetSpaceResponse => {
  //       const newData: UseGetSpaceResponse = {
  //         ...prevData,
  //         data: {
  //           ...prevData.data,
  //           count: (prevData.data?.count || 0) + 1,
  //           results: [...(prevData.data?.results || []), newSpace],
  //         },
  //       }
  //       return newData
  //     })
  //     toast.success('Space created successfully')
  //   },
  //   onError: (error) => {
  //     const errors = JSON.parse(error.message)
  //
  //     const isSlugError = 'slug_name' in errors
  //
  //     if (!isSlugError) {
  //       toast.error(errors.detail || 'Something went wrong')
  //     } else {
  //       toast(
  //         <ul className="space-y-1 font-medium text-brand-semantic-accent-300">
  //           {errors.slug_name.map((error: string) => (
  //             <li key={error} className="capitalize">
  //               {error}
  //             </li>
  //           ))}
  //         </ul>,
  //       )
  //     }
  //   },
  //   revalidate: false,
  // })
  //
  // return { createSpaceTrigger: trigger }
}
