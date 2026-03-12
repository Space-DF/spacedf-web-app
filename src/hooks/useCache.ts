import { useSWRConfig } from 'swr'

export const useCache = () => {
  const { mutate } = useSWRConfig()

  const clearAllCache = () => {
    mutate(() => true, undefined, { revalidate: true })
  }

  const clearCache = (key: string) => {
    mutate(key, undefined, { revalidate: true })
  }

  const clearCacheStartsWith = (prefix: string) => {
    mutate(
      (key) => typeof key === 'string' && key.startsWith(prefix),
      undefined,
      { revalidate: true }
    )
  }

  return {
    clearAllCache,
    clearCache,
    clearCacheStartsWith,
  }
}
