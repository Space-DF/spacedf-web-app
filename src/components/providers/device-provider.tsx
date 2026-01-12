import { DEVICE_MODEL } from '@/constants/device-property'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useDevAuthentication } from '@/hooks/useDevAuthentication'
import { useGetDevices } from '@/hooks/useDevices'
import { useIsDemo } from '@/hooks/useIsDemo'
import MqttService from '@/lib/mqtt'
import {
  DeviceTelemetryData,
  DeviceTelemetryHandler,
  EntityTelemetryData,
  EntityTelemetryHandler,
  MQTTRouter,
} from '@/lib/mqtt-handlers'
import { useGlobalStore } from '@/stores'
import { useDashboardStore } from '@/stores/dashboard-store'
import { Device, useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { Alert } from '@/types/alert'
import { MapType, transformDeviceData } from '@/utils/map'
import { ALERT_MESSAGES, getWaterDepthLevelName } from '@/utils/water-depth'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'
import { useParams } from 'next/navigation'
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useShallow } from 'zustand/react/shallow'

const Rak3DModel = '/3d-model/RAK_3D.glb'
const Tracki3DModel = '/3d-model/airtag.glb'

const PREVIEW_PATH = {
  rak: '/images/3d-preview/rak.png',
  tracki: '/images/3d-preview/airtag.png',
}

const handleWidgetRealtime = (widget: any, data: EntityTelemetryData) => {
  if (
    ['gauge', 'value', 'slider'].some((type) =>
      Array.isArray(widget.display_type)
        ? widget.display_type.includes(type)
        : widget.display_type === type
    )
  ) {
    return {
      ...widget,
      data: {
        value: data.entityUpdate.state,
        unit_of_measurement: data.entityUpdate.unit_of_measurement,
      },
    }
  }
  if (
    ['chart'].some((type) =>
      Array.isArray(widget.display_type)
        ? widget.display_type.includes(type)
        : widget.display_type === type
    )
  ) {
    return {
      ...widget,
      data: {
        data: [
          ...widget.data.data,
          {
            value: data.entityUpdate.state,
            timestamp: data.entityUpdate.timestamp,
          },
        ],
      },
    }
  }
  if (
    ['map'].some((type) =>
      Array.isArray(widget.display_type)
        ? widget.display_type.includes(type)
        : widget.display_type === type
    )
  ) {
    return {
      ...widget,
      data: {
        coordinate: {
          latitude: data.entityUpdate.attributes?.latitude,
          longitude: data.entityUpdate.attributes?.longitude,
        },
      },
    }
  }
  return widget
}

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const mqttServiceRef = useRef<MqttService | null>(null)
  const mqttRouterRef = useRef<MQTTRouter | null>(null)
  const { organization, spaceSlug } = useParams<{
    organization: string
    spaceSlug: string
  }>()
  const isDemo = useIsDemo()
  const isAuthenticated = useAuthenticated()

  const dataUpdatesRef = useRef<Record<string, Device['deviceProperties']>>({})
  const entityKeyRef = useRef<Set<string>>(new Set())

  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = currentSpace?.slug_name || spaceSlug

  const isAuthorized =
    organization && spaceSlugName && !isDemo && isAuthenticated

  const { verified: isDevVerified, isLoading: isDevLoading } =
    useDevAuthentication()
  const {
    setDeviceModel,
    setInitializedSuccess,
    setDevices,
    setModelPreview,
    setDeviceState,
    clearDeviceModels,
    setDeviceProperties,
    setDeviceAlerts,
    devicesFleetTracking,
  } = useDeviceStore(
    useShallow((state) => ({
      setDeviceModel: state.setDeviceModel,
      setInitializedSuccess: state.setInitializedSuccess,
      setDevices: state.setDevices,
      setModelPreview: state.setModelPreview,
      setDeviceState: state.setDeviceState,
      clearDeviceModels: state.clearDeviceModels,
      setDeviceProperties: state.setDeviceProperties,
      devicesFleetTracking: state.devicesFleetTracking,
      setDeviceAlerts: state.setDeviceAlerts,
    }))
  )

  const { setWidgetList, widgetList } = useDashboardStore(
    useShallow((state) => ({
      widgetList: state.widgetList,
      setWidgetList: state.setWidgetList,
    }))
  )

  const { data: deviceSpaces, isLoading: isLoadingDevices } = useGetDevices()

  const setGlobalLoading = useGlobalStore((state) => state.setGlobalLoading)

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
          return handleWidgetRealtime(widget, data)
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
            }

          case 'location':
            entityKeyRef.current.add('location')
            const newLat = (data.entityUpdate as any)?.entity?.attributes
              ?.latitude
            const newLng = (data.entityUpdate as any)?.entity?.attributes
              ?.longitude

            if (newLat && newLng) {
              dataUpdatesRef.current[data.entityUpdate.device_id] = {
                ...dataUpdatesRef.current[data.entityUpdate.device_id],
                latest_checkpoint_arr: [newLng, newLat],
                latest_checkpoint: {
                  latitude: newLat,
                  longitude: newLng,
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
          if (
            result &&
            typeof result === 'object' &&
            'deviceId' in result &&
            'deviceUpdate' in result
          ) {
            handleDeviceTelemetry(result as DeviceTelemetryData)
          } else if (
            result &&
            typeof result === 'object' &&
            'entityId' in result &&
            'entityUpdate' in result
          ) {
            handleEntityTelemetry(result as EntityTelemetryData)
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
  ])

  const getDevices = async () => {
    const devices: Device[] = transformDeviceData(deviceSpaces || [])

    setDevices(devices)
  }

  useEffect(() => {
    loadModels()
    getDevices()
  }, [deviceSpaces])

  useEffect(() => {
    setGlobalLoading(isLoadingDevices)

    setInitializedSuccess(!isLoadingDevices)
  }, [isLoadingDevices])

  const loadModels = async () => {
    try {
      //add new device model to here
      const rakModelResource = fetch(Rak3DModel)
      const trackiModelResource = fetch(Tracki3DModel)

      const [rakModel, trackiModel] = await Promise.all([
        rakModelResource,
        trackiModelResource,
      ])
        .then((responses) =>
          Promise.all(
            responses.map((modelResponse) => modelResponse.arrayBuffer())
          )
        )
        .then((buffers) =>
          Promise.all(buffers.map((buffer) => load(buffer, GLTFLoader)))
        )

      setDeviceModel(DEVICE_MODEL.RAK, rakModel)
      setDeviceModel(DEVICE_MODEL.TRACKI, trackiModel)

      setModelPreview(DEVICE_MODEL.RAK, PREVIEW_PATH.rak)
      setModelPreview(DEVICE_MODEL.TRACKI, PREVIEW_PATH.tracki)
    } catch (error) {
      console.error({ error })
    }
  }

  useEffect(() => {
    return () => {
      clearDeviceModels()
    }
  }, [clearDeviceModels])

  useEffect(() => {
    const mapType =
      (localStorage.getItem('fleet-tracking:mapType') as MapType) || 'default'
    useFleetTrackingStore.setState({
      mapType,
    })
  }, [])

  return <>{children}</>
}
