import { getCookie } from '@/utils'
import { useEffect, useState } from 'react'
import { useMounted } from './useMounted'

export const useOrganization = () => {
  const [organization, setOrganization] = useState('')
  const { mounted } = useMounted()
  useEffect(() => {
    setOrganization(getCookie<string>('organization', ''))
  }, [mounted])

  return { organization, isOrganization: !!organization }
}
