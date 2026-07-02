import { AUTH_API } from '@/shared/env'

export const getValidSubdomain = async (host?: string | null) => {
  let subdomain: string | null = null
  const [, rootDomain] = (process.env.NEXTAUTH_URL || '').split('://')

  if (!host && typeof window !== 'undefined') {
    // On client side, get the host from window
    host = window.location.host
  }

  if (host) {
    // If it's a local/development host or includes the default domain 'myspacedf'
    if (['localhost', 'myspacedf'].some((domain) => host.includes(domain))) {
      if (host.includes('.')) {
        const candidate = host.split('.')[0]
        if (candidate && !candidate.includes('localhost')) {
          // Valid candidate
          subdomain = candidate
        }
      }
    } else {
      // It's a custom domain, resolve the organization via API
      try {
        const response = await fetch(
          `${AUTH_API}/api/custom-domains/resolve?host=${host}`
        )
        if (response.ok) {
          const data = await response.json()
          subdomain = data?.org_slug || null
        }
      } catch (error) {
        console.error('Error resolving custom domain:', error)
      }
    }
  }

  if (rootDomain === host) return ''

  return subdomain
}
