import Cookies from "js-cookie"
import { isJsonString } from "./validate"

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

export const setCookie = <TValue = any>(key: string, value: TValue) => {
  if (typeof value === "string") {
    document.cookie = `${key}=${value}`

    return
  }

  document.cookie = `${key}=${JSON.stringify(value)}`
}
