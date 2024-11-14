export const uppercaseFirstLetter = (originalString: string) => {
  if (!originalString) return ''
  const fistLetterUppercase = originalString.substring(0, 1).toUpperCase()
  const resString = originalString.substring(1, originalString.length)

  return fistLetterUppercase + resString
}

export const generateOrganizationDomain = (organizationName: string) => {
  if (!organizationName) return ''
  return organizationName?.replaceAll(' ', '').toLowerCase()
}

export function getSubdomain(fullUrl: string, rootDomain: string) {
  const envDomain = ['localhost', 'develop']
  const prodDomain = ['danang', 'spacedf']

  if (envDomain.some((domain) => fullUrl.includes(domain))) return 'develop'

  if (prodDomain.some((domain) => fullUrl.includes(domain))) return 'danang'

  return ''
}
