import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import queryString from 'query-string'

import api from '@/lib/api'
import { useGlobalStore } from '@/stores'

const deleteBuilding = async (url: string) => api.delete(url)

export const useDeleteBuilding = (buildingId?: string) => {
  const t = useTranslations('smartBuilding')
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name

  return useSWRMutation(
    buildingId && spaceSlugName
      ? queryString.stringifyUrl({
          url: `/api/building/${buildingId}`,
          query: { spaceSlug: spaceSlugName },
        })
      : null,
    deleteBuilding,
    {
      onSuccess: () => {
        toast.success(t('delete_building_success'))
      },
      onError: (error) => {
        toast.error(error?.message || t('delete_building_error'))
      },
    }
  )
}
