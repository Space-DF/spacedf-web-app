export const getValidSubdomain = async (host?: string | null) => {
  let subdomain: string | null = null
  const [, rootDomain] = (process.env.NEXTAUTH_URL || '').split('://')

  if (!host && typeof window !== 'undefined') {
    // On client side, get the host from window
    host = window.location.host
  }

  if (host && host.includes('.')) {
    const candidate = host.split('.')[0]
    if (candidate && !candidate.includes('localhost')) {
      // Valid candidate
      subdomain = candidate
    }
  }

  if (rootDomain === host) return ''

  return subdomain
}
