import { spaceClient } from '@/lib/spacedf'
import {
  DASHBOARD_MQTT_BROKER,
  DASHBOARD_MQTT_PASSWORD,
  DASHBOARD_MQTT_PORT,
  DASHBOARD_MQTT_PROTOCOL,
  DASHBOARD_MQTT_USERNAME,
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
        broker: DASHBOARD_MQTT_BROKER,
        protocol: DASHBOARD_MQTT_PROTOCOL,
        port: DASHBOARD_MQTT_PORT,
        username: DASHBOARD_MQTT_USERNAME,
        password: DASHBOARD_MQTT_PASSWORD,
      })
    }
    const spacedfClient = await spaceClient()
    spacedfClient.setAccessToken(sessionCookie?.user?.access)
    await spacedfClient.users.getMe()
    return NextResponse.json({
      mqtt_token: sessionCookie?.user?.access,
      broker: DASHBOARD_MQTT_BROKER,
      protocol: DASHBOARD_MQTT_PROTOCOL,
      port: DASHBOARD_MQTT_PORT,
      username: DASHBOARD_MQTT_USERNAME,
      password: DASHBOARD_MQTT_PASSWORD,
    })
  } catch (error) {
    return handleError(error)
  }
}
