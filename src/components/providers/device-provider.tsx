import { Device, useDeviceStore } from '@/stores/device-store'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  MQTTRouter,
  DeviceTelemetryHandler,
  DeviceTelemetryData,
  EntityTelemetryHandler,
  EntityTelemetryData,
} from '@/lib/mqtt-handlers'
import MqttService from '@/lib/mqtt'
import { transformDeviceData } from '@/utils/map'
import { useGetDevices } from '@/hooks/useDevices'
import { useGlobalStore } from '@/stores'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useIsDemo } from '@/hooks/useIsDemo'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { DEVICE_MODEL } from '@/constants/device-property'

const Rak3DModel = '/3d-model/RAK_3D.glb'
const Tracki3DModel = '/3d-model/airtag.glb'

const PREVIEW_PATH = {
  rak: '/images/3d-preview/rak.png',
  tracki: '/images/3d-preview/airtag.png',
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

  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = currentSpace?.slug_name || spaceSlug

  const isAuthorized =
    organization && spaceSlugName && !isDemo && isAuthenticated

  const {
    setDeviceModel,
    setInitializedSuccess,
    setDevices,
    setModelPreview,
    setDeviceState,
    clearDeviceModels,
  } = useDeviceStore(
    useShallow((state) => ({
      setDeviceModel: state.setDeviceModel,
      setInitializedSuccess: state.setInitializedSuccess,
      setDevices: state.setDevices,
      setModelPreview: state.setModelPreview,
      setDeviceState: state.setDeviceState,
      clearDeviceModels: state.clearDeviceModels,
    }))
  )

  const { data: deviceSpaces, isLoading: isLoadingDevices } = useGetDevices()

  const setGlobalLoading = useGlobalStore((state) => state.setGlobalLoading)

  const [fetchStatus, setFetchStatus] = useState({
    initializedModels: false,
    initializedDevices: false,
  })

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
  const handleEntityTelemetry = (data: EntityTelemetryData) => {
    // TODO: Update entity store when created
    console.log(
      `🌊 Entity ${data.entityId} (${data.entityType}) telemetry updated:`,
      data.entityUpdate
    )
  }

  useEffect(() => {
    if (isDemo) return
    // Initialize MQTT router and handlers
    mqttRouterRef.current = new MQTTRouter()

    // Register device telemetry handler (no store dependency)
    const deviceTelemetryHandler = new DeviceTelemetryHandler()
    mqttRouterRef.current.registerHandler(deviceTelemetryHandler)

    // Register entity telemetry handler
    const entityTelemetryHandler = new EntityTelemetryHandler()
    mqttRouterRef.current.registerHandler(entityTelemetryHandler)

    // Initialize MQTT connection
    const handleMqttConnect = async () => {
      mqttServiceRef.current = MqttService.getInstance(organization)
      await mqttServiceRef.current.initialize()

      mqttServiceRef.current.setEventCallbacks({
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
        onMessage: (topic: string, payload: Buffer) => {
          // Route through handler system and get parsed results
          const results =
            mqttRouterRef.current?.routeMessage(topic, payload) || []

          // Handle each parsed result
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
  }, [isAuthorized, spaceSlugName, organization, isDemo])

  const getDevices = async () => {
    try {
      const devices: Device[] = transformDeviceData(deviceSpaces || [])

      console.log({ deviceSpaces, devices })

      setDevices(devices)
    } catch {}
  }

  useEffect(() => {
    loadModels()
    getDevices()
  }, [deviceSpaces])

  useEffect(() => {
    setGlobalLoading(true)
    if (!isLoadingDevices && fetchStatus.initializedModels) {
      setGlobalLoading(false)
      setInitializedSuccess(true)
    }
  }, [fetchStatus.initializedModels, isLoadingDevices])

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

      setFetchStatus((prev) => ({
        ...prev,
        initializedModels: true,
      }))
    } catch (error) {
      console.error({ error })
    }
  }

  useEffect(() => {
    return () => {
      clearDeviceModels()
    }
  }, [clearDeviceModels])

  return <>{children}</>
}
