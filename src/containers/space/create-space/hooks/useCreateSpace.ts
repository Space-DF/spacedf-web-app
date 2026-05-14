import { api } from '@/lib/api'
import { Space } from '@/types/space'
import { useMutation } from '@tanstack/react-query'

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

export const useCreateSpace = () =>
  useMutation({
    mutationFn: createSpace,
  })
