'use server'

import { SpaceDFClient } from '@/lib/spacedf'
import { OrganizationSetting } from '@/types/organization'

/**
 * Validates if an organization slug exists using the SpaceDF SDK
 * @param slugName - The organization slug to validate
 * @returns Promise<boolean> - True if organization exists, false otherwise
 */
export async function checkSlugName(slugName: string): Promise<{
  isValid: boolean
  template: string
  setting?: OrganizationSetting
}> {
  try {
    const spaceDFInstance = await SpaceDFClient.getInstance()
    const client = spaceDFInstance.getClient()

    const { result, ...rest } = (await client.organizations.checkSlugName(
      slugName
    )) as {
      result: string
      template: string
      setting?: OrganizationSetting
    }
    // API returns { result: "The organization is valid." } for valid orgs
    return {
      isValid: result === 'The organization is valid.',
      ...rest,
    }
  } catch (error) {
    console.error('Error validating organization slug:', error)
    return {
      isValid: false,
      template: 'fleet-tracking',
    }
  }
}
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
