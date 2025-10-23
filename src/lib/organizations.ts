'use server'

import { SpaceDFClient } from '@/lib/spacedf'

/**
 * Validates if an organization slug exists using the SpaceDF SDK
 * @param slugName - The organization slug to validate
 * @returns Promise<boolean> - True if organization exists, false otherwise
 */
export async function checkSlugName(slugName: string): Promise<boolean> {
  try {
    const spaceDFInstance = await SpaceDFClient.getInstance()
    const client = spaceDFInstance.getClient()

    const result = await client.organizations.checkSlugName(slugName)

    // API returns { result: "The organization is valid." } for valid orgs
    return result?.result === 'The organization is valid.'
  } catch (error) {
    console.error('Error validating organization slug:', error)
    return false
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
