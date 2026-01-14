import { NextRequest, NextResponse } from 'next/server'

const EMAIL = process.env.NEXT_PUBLIC_JUPYTER_EMAIL
const PASSWORD = process.env.NEXT_PUBLIC_JUPYTER_PASSWORD
const JUPYTER_HUB_API = process.env.NEXT_PUBLIC_JUPYTER_HUB_API

const JUPYTER_AUTH_API = process.env.NEXT_PUBLIC_JUPYTER_AUTH_API

export const POST = async (req: NextRequest) => {
  try {
    const responseCredentials = await fetch(JUPYTER_AUTH_API!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    })

    const dataCredentials = await responseCredentials.json()
    const { access } = dataCredentials
    const { sdp } = await req.json()
    const response = await fetch(JUPYTER_HUB_API!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        Authorization: `Bearer ${access}`,
      },
      body: sdp,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const sdpResponse = await response.text()

    return NextResponse.json({
      sdp: sdpResponse,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to process WebRTC request' },
      { status: 500 }
    )
  }
}
