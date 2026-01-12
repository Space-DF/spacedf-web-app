import { api } from '@/lib/api'
import { Space } from '@/types/space'
import useSWRMutation from 'swr/mutation'

const createSpace = (
  url: string,
  { arg }: { arg: Partial<Omit<Space, 'logo'> & { logo: File }> }
) => {
  const formData = new FormData()
  formData.append('logo', arg.logo as File)
  formData.append('name', arg.name as string)
  formData.append('slug_name', arg.slug_name as string)
  return api.post<Space>(url, formData)
}

export const useCreateSpace = () => useSWRMutation('/api/spaces', createSpace)
