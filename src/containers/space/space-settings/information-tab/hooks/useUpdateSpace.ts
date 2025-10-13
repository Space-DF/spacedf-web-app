import api from '@/lib/api'
import { Space } from '@/types/space'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

const updateSpace = (
  url: string,
  { arg }: { arg: Partial<Space & { logo: File }> }
) => {
  const formData = new FormData()
  if (arg.name) {
    formData.append('name', arg.name)
  }
  if (arg.description) {
    formData.append('description', arg.description)
  }
  if (arg.logo) {
    formData.append('logo', arg.logo)
  }
  return api.patch(url, formData)
}

export const useUpdateSpace = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(`/api/spaces?slug_name=${spaceSlug}`, updateSpace)
}
