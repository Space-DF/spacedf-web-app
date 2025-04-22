import useSWRMutation from 'swr/mutation'

interface SocialAuthResponse {
  redirectUrl: string
}

const fetcher = async (
  url: string,
  {
    arg,
  }: {
    arg: {
      provider: 'google' | 'apple'
    }
  }
): Promise<SocialAuthResponse> => {
  const { provider } = arg
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      provider,
      callback_url: window?.location.href || '',
    }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw data
  }
  return data
}

export const useSocialAuth = () => useSWRMutation('/api/auth/social', fetcher)
