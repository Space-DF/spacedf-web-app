'use server'

import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

type CreateOrganizationActionPayload = {
  name: string
  logo: string
  slug_name: string
}

export const createOrganizationAction = async (
  payload: CreateOrganizationActionPayload
) => {
  const session = await getServerSession(authOptions)

  // return new NextResponse(
  //   JSON.stringify({
  //     message: 'Success',
  //   }),
  //   {
  //     status: 200,
  //   },
  // )

  const resp = await fetch(
    process.env.NEXT_PUBLIC_CONSOLE_API + '/api/organizations',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  )

  if (resp.ok) {
    return 'Success'
  } else {
    const responseJson = await resp.json()

    return responseJson
  }
}
