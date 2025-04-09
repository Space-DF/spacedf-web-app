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
    arg: File
  }
) => {
  const formData = new FormData()
  formData.append('image', arg)
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw response.json()
  }
  return response.json()
}
export const useUploadImage = () => {
  const { organization } = useParams<{ organization: string }>()
  return useSWRMutation<UploadImageResponse, Error, string, File>(
    `/api/profile/${organization}`,
    uploadImageProfile
  )
}
