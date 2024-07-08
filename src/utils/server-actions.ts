import { cookies } from "next/headers"
import { isJsonString } from "./validate"

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
