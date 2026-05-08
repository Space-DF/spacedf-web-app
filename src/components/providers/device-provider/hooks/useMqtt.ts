import {
  DeviceTelemetryData,
  DeviceTelemetryHandler,
  EntityTelemetryData,
  EntityTelemetryHandler,
  EventHandler,
  MQTTRouter,
} from '@/lib/mqtt-handlers'
import { useDashboardStore } from '@/stores/dashboard-store'
import { Device, useDeviceStore } from '@/stores/device-store'
import { Alert } from '@/types/alert'
import { ALERT_MESSAGES, getWaterDepthLevelName } from '@/utils/water-depth'
import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { v4 as uuidv4 } from 'uuid'
import { useIsDemo } from '@/hooks/useIsDemo'
import { getWidgetRealtime } from '../utils'
import { useDevAuthentication } from '@/hooks/useDevAuthentication'
import MqttService from '@/lib/mqtt'
import { useParams } from 'next/navigation'
import { useGlobalStore } from '@/stores'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { toast } from 'sonner'
import { useEventStore } from '@/containers/devices/components/device-detail/stores/event'
import { TelemetryEvent } from '@/types/event'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object'

const isDeviceTelemetryResult = (
  value: unknown
): value is DeviceTelemetryData =>
  isRecord(value) &&
  typeof value.deviceId === 'string' &&
  'deviceUpdate' in value

const isEntityTelemetryResult = (
  value: unknown
): value is EntityTelemetryData =>
  isRecord(value) &&
  typeof value.entityId === 'string' &&
  'entityUpdate' in value

const isDeviceEventResult = (
  value: unknown
): value is { deviceId: string; event: TelemetryEvent } =>
  isRecord(value) && typeof value.deviceId === 'string' && 'event' in value

export const useMqtt = () => {
  const {
    setDeviceState,
    devicesFleetTracking,
    setDeviceProperties,
    setDeviceAlerts,
  } = useDeviceStore((state) => ({
    setDeviceState: state.setDeviceState,
    devicesFleetTracking: state.devicesFleetTracking,
    setDeviceProperties: state.setDeviceProperties,
    setDeviceAlerts: state.setDeviceAlerts,
  }))

  const { setWidgetList, widgetList } = useDashboardStore(
    useShallow((state) => ({
      widgetList: state.widgetList,
      setWidgetList: state.setWidgetList,
    }))
  )

  const insertDeviceEvents = useEventStore((state) => state.insertDeviceEvents)

  const { organization, spaceSlug } = useParams<{
    organization: string
    spaceSlug: string
  }>()

  const isAuthenticated = useAuthenticated()
  const isDemo = useIsDemo()

  const { verified: isDevVerified, isLoading: isDevLoading } =
    useDevAuthentication()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = currentSpace?.slug_name || spaceSlug
  const isAuthorized =
    organization && spaceSlugName && !isDemo && isAuthenticated

  const entityKeyRef = useRef<Set<string>>(new Set())
  const dataUpdatesRef = useRef<Record<string, Device['deviceProperties']>>({})
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mqttRouterRef = useRef<MQTTRouter | null>(null)
  const mqttServiceRef = useRef<MqttService | null>(null)

  // Handler for processed telemetry data
  const handleDeviceTelemetry = (data: DeviceTelemetryData) => {
    // Business logic: Update device store with parsed telemetry data
    setDeviceState(data.deviceId, data.deviceUpdate)

    // Additional business logic can be added here:
    // - Check for alerts (low battery, geofence violations)
    // - Log device activity
    // - Trigger notifications
    // TODO: Please remove this console.log after testing
    console.log(
      `📍 Device ${data.deviceId} telemetry updated:`,
      data.deviceUpdate
    )
  }

  // Handler for processed entity telemetry data
  const handleEntityTelemetry = useCallback(
    (data: EntityTelemetryData) => {
      // TODO: Update entity store when created
      console.log(
        `🌊 Entity ${data.entityId} (${data.entityType}) entity updated:`,
        data.entityUpdate
      )
      const newWidgetList = widgetList.map((widget) => {
        if (widget.entity_id === data.entityId) {
          return getWidgetRealtime(widget, data)
        }
        return widget
      })
      setWidgetList(newWidgetList)

      if (data.entityUpdate.device_id) {
        switch (data.entityType) {
          case 'water_depth':
            entityKeyRef.current.add('water_depth')
            const newWaterDepth =
              typeof data.entityUpdate.state === 'number'
                ? data.entityUpdate.state
                : devicesFleetTracking[data.entityUpdate.device_id]
                    ?.deviceProperties?.water_depth || 0

            dataUpdatesRef.current[data.entityUpdate.device_id] = {
              ...dataUpdatesRef.current[data.entityUpdate.device_id],
              water_depth: newWaterDepth,
              water_level_name: getWaterDepthLevelName(newWaterDepth),
            }

          case 'location':
            entityKeyRef.current.add('location')
            const newLat = (data.entityUpdate as any)?.entity?.attributes
              ?.latitude
            const newLng = (data.entityUpdate as any)?.entity?.attributes
              ?.longitude

            const bearing = (data.entityUpdate as any)?.entity?.attributes
              ?.bearing

            if (newLat && newLng) {
              dataUpdatesRef.current[data.entityUpdate.device_id] = {
                ...dataUpdatesRef.current[data.entityUpdate.device_id],
                latest_checkpoint_arr: [newLng, newLat, bearing],
                latest_checkpoint: {
                  latitude: newLat,
                  longitude: newLng,
                  bearing,
                },
              }
            }
            break

          // case 'battery':
          //   const newBattery =
          //     typeof data.entityUpdate?.entity?.state === 'number'
          //       ? data.entityUpdate.entity?.state
          //       : devicesFleetTracking[data.entityUpdate.device_id]
          //           ?.deviceProperties?.battery || 0

          //   dataUpdatesRef.current[data.entityUpdate.device_id] = {
          //     ...dataUpdatesRef.current[data.entityUpdate.device_id],
          //     battery: newBattery,
          //   }
          //   break
          // default:
        }

        handleEntityTelemetryFlush()
      }
    },
    [devicesFleetTracking, widgetList]
  )

  const handleEntityTelemetryFlush = () => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current)
      flushTimeoutRef.current = null
    }

    flushTimeoutRef.current = setTimeout(() => {
      const deviceIds = Object.keys(dataUpdatesRef.current)
      deviceIds.forEach((deviceId) => {
        setDeviceProperties(deviceId, dataUpdatesRef.current[deviceId])

        if (entityKeyRef.current.has('water_depth')) {
          handleUpdateAlertStore(deviceId, dataUpdatesRef.current[deviceId])
        }
      })
      dataUpdatesRef.current = {}
      entityKeyRef.current.clear()
    }, 300)
  }

  const handleUpdateAlertStore = (
    deviceId: string,
    data: Device['deviceProperties']
  ) => {
    if (typeof data?.water_depth !== 'number') return

    const waterDepthLevel = getWaterDepthLevelName(data.water_depth)
    const entityId = uuidv4()
    const reportedAt = new Date().toISOString()

    const newAlert: Alert = {
      id: entityId,
      device_id: deviceId,
      entity_id: entityId,
      entity_name: 'Water Depth',
      level: waterDepthLevel,
      location: data.latest_checkpoint || { latitude: 0, longitude: 0 },
      message: ALERT_MESSAGES[waterDepthLevel],
      reported_at: reportedAt,
      space_slug: '',
      threshold: {
        warning: 0,
        critical: 0,
      },
      type: waterDepthLevel,
      unit: 'cm',
      water_depth: data.water_depth,
      water_level: data.water_depth,
    }

    setDeviceAlerts(deviceId, 'water_depth', newAlert)
  }

  useEffect(() => {
    if (isDemo || isDevLoading || !isDevVerified) return
    mqttRouterRef.current = new MQTTRouter()

    // Register device telemetry handler (no store dependency)
    const deviceTelemetryHandler = new DeviceTelemetryHandler()
    mqttRouterRef.current.registerHandler(deviceTelemetryHandler)

    // Register entity telemetry handler
    const entityTelemetryHandler = new EntityTelemetryHandler()
    mqttRouterRef.current.registerHandler(entityTelemetryHandler)

    // Register event handler
    const eventHandler = new EventHandler()
    mqttRouterRef.current.registerHandler(eventHandler)

    const handleMqttConnect = async () => {
      mqttServiceRef.current = MqttService.getInstance(organization)
      await mqttServiceRef.current.initialize()
      mqttServiceRef.current?.setEventCallbacks({
        onReconnect: () => {
          toast.info('MQTT reconnecting...', {
            position: 'bottom-right',
          })
        },
        onConnect: () => {
          const publicDeviceTopic = `tenant/${organization}/device/+/telemetry`
          const spaceDeviceTopic = `tenant/${organization}/space/${spaceSlugName}/device/+/telemetry`
          const publicEntityTopic = `tenant/${organization}/entity/+/telemetry`
          const spaceEntityTopic = `tenant/${organization}/space/${spaceSlugName}/entity/+/telemetry`
          const spaceEventTopic = `tenant/${organization}/space/${spaceSlugName}/device/+/event`

          const currentSubscriptions =
            mqttServiceRef.current?.getSubscriptions() || []
          currentSubscriptions.forEach((topic) => {
            mqttServiceRef.current?.unsubscribe(topic)
          })

          mqttServiceRef.current?.subscribe(
            isAuthorized
              ? [
                  spaceDeviceTopic,
                  publicDeviceTopic,
                  spaceEntityTopic,
                  publicEntityTopic,
                  spaceEventTopic,
                ]
              : [publicDeviceTopic, publicEntityTopic]
          )
        },
        onSubscribed: () => {
          toast.success('MQTT connected', {
            position: 'bottom-right',
            id: 'mqtt-connected',
          })
        },
        onDisconnect: () => {
          toast.error('MQTT disconnected', {
            position: 'bottom-right',
          })
        },
        onError: (err) => {
          toast.error('MQTT error: ' + err.message, {
            position: 'bottom-right',
          })
        },
      })
    }

    handleMqttConnect()

    return () => {
      mqttServiceRef.current?.disconnect()
      mqttServiceRef.current = null
      if (mqttRouterRef.current) {
        mqttRouterRef.current.cleanup()
        mqttRouterRef.current = null
      }
    }
  }, [organization, spaceSlugName, isAuthorized, isDevVerified, isDevLoading])

  useEffect(() => {
    if (
      isDemo ||
      !mqttServiceRef.current ||
      !mqttRouterRef.current ||
      isDevLoading ||
      !isDevVerified
    )
      return
    mqttServiceRef.current?.setEventCallbacks({
      onMessage: (topic: string, payload: Buffer) => {
        const results =
          mqttRouterRef.current?.routeMessage(topic, payload) || []

        results.forEach((result) => {
          if (isDeviceTelemetryResult(result)) {
            handleDeviceTelemetry(result)
            return
          }

          if (isEntityTelemetryResult(result)) {
            handleEntityTelemetry(result)
            return
          }

          if (isDeviceEventResult(result)) {
            insertDeviceEvents(result.deviceId, result.event)
          }
        })
      },
    })
  }, [
    devicesFleetTracking,
    isDemo,
    isDevLoading,
    isDevVerified,
    handleEntityTelemetry,
    insertDeviceEvents,
  ])
}
