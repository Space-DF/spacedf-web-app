import { spaceClient } from '@/lib/spacedf'
import {
  MQTT_BROKER,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_PROTOCOL,
  MQTT_USERNAME,
} from '@/shared/env'
import { handleError } from '@/utils/error'
import { isDemoSubdomain, readSession } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = await readSession()
    const isDemo = await isDemoSubdomain(req)
    if (!sessionCookie || isDemo) {
      return NextResponse.json({
        mqtt_token: null,
        broker: MQTT_BROKER,
        protocol: MQTT_PROTOCOL,
        port: MQTT_PORT,
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD,
      })
    }
    const spacedfClient = await spaceClient()
    spacedfClient.setAccessToken(sessionCookie?.user?.access)
    await spacedfClient.users.getMe()
    return NextResponse.json({
      mqtt_token: sessionCookie?.user?.access,
      broker: MQTT_BROKER,
      protocol: MQTT_PROTOCOL,
      port: MQTT_PORT,
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
    })
  } catch (error) {
    return handleError(error)
  }
}
