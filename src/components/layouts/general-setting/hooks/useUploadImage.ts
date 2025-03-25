import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

export type UploadImageResponse = {
  file_name: string
  presigned_url: string
}

const uploadImageProfile = async (
  url: string,
  {
    arg,
  }: {
    arg: {
      image: File
    }
  }
) => {
  const formData = new FormData()
  formData.append('image', arg.image)
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw errorData
  }
  const result = await response.json()
  return result.response_data as UploadImageResponse
}
export const useUploadImage = () => {
  const { organization } = useParams<{ organization: string }>()
  return useSWRMutation(`/api/profile/${organization}`, uploadImageProfile)
}
