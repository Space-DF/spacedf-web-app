import { useOrganizationValidationStore } from '@/stores/organization-validation-store'
import type { CustomPage, CustomPageType } from '@/types/organization'

export const useCustomPage = (
  pageType?: CustomPageType
): CustomPage | undefined => {
  const customPages = useOrganizationValidationStore(
    (state) => state.setting?.custom_pages
  )

  if (!pageType) return undefined

  return customPages?.find((page) => page.page_type === pageType)
}
