import { NextRequest, NextResponse } from 'next/server'

let widgets: any[] = []

const GET = async () => {
  try {
    return NextResponse.json(widgets, {
      status: 200,
    })
  } catch (errors: any) {
    return NextResponse.json(
      {
        ...(errors?.error || {}),
      },
      {
        status: errors.status,
      }
    )
  }
}

const POST = async (request: NextRequest) => {
  const body = await request.json()

  widgets = [...widgets, body]

  return NextResponse.json(body, { status: 200 })
}

const PUT = async (request: NextRequest) => {
  const body = await request.json()

  widgets = body

  return NextResponse.json(body, { status: 200 })
}

const PATCH = async (request: NextRequest) => {
  const body = await request.json()

  const widgetID = body.widgetId
  const newData = body.dataUpdated

  if (!widgetID) {
    return NextResponse.json(
      { error: 'Widget ID is required' },
      { status: 400 }
    )
  }

  const newWidgets = widgets.map((widget) =>
    widget.id === widgetID
      ? {
          ...widget,
          ...newData,
        }
      : widget
  )

  const dataResponse = newWidgets.find((widget) => widget.id === widgetID)

  widgets = newWidgets

  return NextResponse.json(dataResponse, { status: 200 })
}

const DELETE = async (request: NextRequest) => {
  const body = await request.json()

  const widgetID = body.widgetId

  if (!widgetID) {
    return NextResponse.json(
      { error: 'Widget ID is required' },
      { status: 400 }
    )
  }

  const newWidgets = widgets.filter((widget) => widget.id !== widgetID)

  widgets = newWidgets

  return NextResponse.json(
    {
      idDeleted: widgetID,
    },
    { status: 200 }
  )
}

export { GET, POST, PUT, PATCH, DELETE }
