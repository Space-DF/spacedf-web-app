import api from '@/lib/api'
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
  const response = await api.post<UploadImageResponse>(url, formData)
  return response
}
export const useUploadImage = () =>
  useSWRMutation(`/api/me`, uploadImageProfile)
