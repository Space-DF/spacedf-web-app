import { cookies } from "next/headers"

export const getCookieServer = <TDefaultValue = any>(
  key: string,
  defaultValue: TDefaultValue
) => {
  const cookie = cookies().get(key)

  if (cookie) return JSON.parse(cookie.value) as TDefaultValue

  return defaultValue
}
