import { FetchAPI } from '@/lib/fecth'
import { ApiErrorResponse } from '@/types/global'
import { Profile } from '@/types/profile'
import { generateOrganizationUrl } from '@/utils'
import { NextResponse } from 'next/server'

type PresignedUrl = {
  file_name: string
  presigned_url: string
}

export const POST = async (
  request: Request,
  { params }: { params: { organization: string } }
) => {
  const formData = await request.formData()
  const file = formData.get('image') as File
  if (!file)
    return NextResponse.json({ message: 'Image is required' }, { status: 400 })
  try {
    const fetchApi = new FetchAPI()
    const { organization } = params
    const baseURL = generateOrganizationUrl(organization)
    fetchApi.setURL(baseURL)
    const data = await fetchApi.get<PresignedUrl>('presigned-url')
    const presignedUrl = data.response_data.presigned_url
    const fileBuffer = await file.arrayBuffer()

    const responseImage = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileBuffer,
    })
    if (!responseImage.ok) {
      const error = await responseImage.json()
      throw new Error(error)
    }
    const newImageUrl = presignedUrl.split('?')[0]
    return NextResponse.json({
      ...data,
      response_data: { ...data.response_data, presigned_url: newImageUrl },
    })
  } catch (error) {
    const errorResponse = error as ApiErrorResponse
    return NextResponse.json(
      {
        message: errorResponse.detail || 'Something went wrong',
      },
      { status: errorResponse.code || 400 }
    )
  }
}

export const GET = async (
  _: Request,
  { params }: { params: { organization: string } }
) => {
  const { organization } = params
  const baseURL = generateOrganizationUrl(organization)
  const fetch = new FetchAPI()
  fetch.setURL(baseURL)
  try {
    const response = await fetch.get('auth/profile')
    return NextResponse.json(response)
  } catch (error) {
    console.log({ error })
    const errorResponse = error as ApiErrorResponse
    return NextResponse.json(
      {
        message: errorResponse.detail || 'Something went wrong',
      },
      { status: errorResponse.code || 400 }
    )
  }
}

export const PUT = async (
  request: Request,
  { params }: { params: { organization: string } }
) => {
  const body: Omit<Profile, 'id'> = await request.json()
  const { organization } = params
  const baseURL = generateOrganizationUrl(organization)
  const fetch = new FetchAPI()
  fetch.setURL(baseURL)
  try {
    const response = await fetch.put('auth/profile', body)
    return NextResponse.json(response)
  } catch (error) {
    const errorResponse = error as ApiErrorResponse
    return NextResponse.json(
      {
        message: errorResponse.detail || 'Something went wrong',
      },
      { status: errorResponse.code || 400 }
    )
  }
}
