import { NextRequest, NextResponse } from 'next/server'

const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    return NextResponse.json(
      {
        message: 'Success',
        data: {
          slug_name: body.slug_name,
        },
      },
      {
        status: 200,
      },
    )
  } catch (err) {
    // const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json({ message: 'error' || 'Something went wrong' })
  }
}

export { POST }
