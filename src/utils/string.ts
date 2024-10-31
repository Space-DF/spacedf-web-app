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
  fullUrl = fullUrl.replace(/^https?:\/\//, '').replace(/^www\./, '')

  if (fullUrl === rootDomain) return ''

  const [hostname] = fullUrl.split('/')

  const subdomain = hostname.replace(`.${rootDomain}`, '')

  return subdomain
}
