import { cache } from 'react'
import { SpaceDFClient } from '@/lib/spacedf'
import { OrganizationSetting } from '@/types/organization'

interface OrgResponse {
  result: string
  template: string
  setting?: OrganizationSetting
  plan: 'free' | 'pro'
}

interface OrgCheckResponse extends Omit<OrgResponse, 'result' | 'plan'> {
  isValid: boolean
  isPro: boolean
}

/**
 * Validates if an organization slug exists using the SpaceDF SDK
 * @param slugName - The organization slug to validate
 * @returns Promise<boolean> - True if organization exists, false otherwise
 */
export const checkSlugName = cache(
  async (slugName: string): Promise<OrgCheckResponse> => {
    try {
      const spaceDFInstance = await SpaceDFClient.getInstance()
      const client = spaceDFInstance.getClient()

      const { result, plan, ...rest } =
        (await client.organizations.checkSlugName(slugName)) as OrgResponse
      const isPro = plan === 'pro'
      // API returns { result: "The organization is valid." } for valid orgs
      return {
        isValid: result === 'The organization is valid.',
        isPro,
        ...rest,
      }
    } catch (error) {
      console.error('Error validating organization slug:', error)
      return {
        isValid: false,
        template: 'fleet-tracking',
        isPro: false,
      }
    }
  }
)
/**
 * Fallback validation using the current hardcoded list
 * This can be removed once SDK validation is confirmed working
 */
export async function validateOrganizationFallback(
  org: string
): Promise<boolean> {
  const AVAILABLE_ORGS = ['demo', 'develop', 'digitalfortress', 'danang']
  return AVAILABLE_ORGS.includes(org)
}
