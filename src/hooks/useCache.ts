import { useSWRConfig } from 'swr'

export const useCache = () => {
  const { mutate, cache } = useSWRConfig()

  const clearAllCache = () => {
    mutate(() => true, undefined, { revalidate: true })
  }

  const clearCache = (key: string) => {
    mutate(key, undefined, { revalidate: true })
  }

  const clearCacheStartsWith = (prefix: string) => {
    const keys = Array.from(cache.keys())
    for (const key of keys) {
      if (key.includes(prefix)) {
        mutate(key)
      }
    }
  }

  return {
    clearAllCache,
    clearCache,
    clearCacheStartsWith,
  }
}
