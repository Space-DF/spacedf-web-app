import api from '@/lib/api'
import { useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

export const useUpdateRoleMember = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (arg: { id: string; space_role: string }) =>
      api.patch(`/api/spaces/${spaceSlug}/members`, arg),
  })

  return { trigger: mutateAsync, isMutating: isPending }
}
