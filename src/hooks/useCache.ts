import { useSWRConfig } from 'swr'

export const useCache = () => {
  const { mutate } = useSWRConfig()

  const clearAllCache = () => {
    mutate(() => true, undefined, { revalidate: true })
  }

  return {
    clearAllCache,
  }
}
