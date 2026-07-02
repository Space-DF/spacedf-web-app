import api from '@/lib/api'
import { Space } from '@/types/space'
import { useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

export const useUpdateSpace = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const { mutate, isPending } = useMutation({
    mutationFn: (arg: Partial<Space & { logo: File }>) => {
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
      return api.patch(`/api/spaces?slug_name=${spaceSlug}`, formData)
    },
  })

  return { trigger: mutate, isMutating: isPending }
}
