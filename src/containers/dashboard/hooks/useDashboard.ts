import useSWR from 'swr'
import { Dashboard } from '..'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const useDashboard = () =>
  useSWR<Dashboard[]>('/api/dashboard', fetcher, {
    fallbackData: [],
  })
