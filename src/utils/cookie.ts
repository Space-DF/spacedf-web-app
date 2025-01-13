import Cookies from 'js-cookie'
import { isJsonString } from './validate'

export const getCookie = <TDefaultValue = any>(
  key: string,
  defaultValue: TDefaultValue
) => {
  const cookie = Cookies.get(key)

  if (cookie)
    return isJsonString(cookie)
      ? (JSON.parse(cookie) as TDefaultValue)
      : (cookie as TDefaultValue)

  return defaultValue
}

export const setCookie = <TValue = any>(
  key: string,
  value: TValue,
  path = '/'
) => {
  if (typeof value === 'string') {
    Cookies.set(key, value, { path })
    return
  }

  Cookies.set(key, JSON.stringify(value), { path })
}

export const deleteCookie = (key: string) => {
  Cookies.remove(key)
}
