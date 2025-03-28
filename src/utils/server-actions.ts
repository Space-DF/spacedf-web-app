import { cookies } from 'next/headers'
import { isJsonString } from './validate'

export const getCookieServer = <TDefaultValue = any>(
  key: string,
  defaultValue: TDefaultValue
) => {
  const cookie = cookies().get(key)

  if (cookie)
    return isJsonString(cookie.value)
      ? JSON.parse(cookie.value)
      : (cookie.value as TDefaultValue)

  return defaultValue
}

export const getServerOrganization = async () => {
  const cookieStore = await cookies()
  return (cookieStore.get('organization')?.value || '') as string
}

export const getServerSpace = () => {
  const cookieStore = cookies()
  return (cookieStore.get('space')?.value || '') as string
}
