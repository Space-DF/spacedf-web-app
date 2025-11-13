import { Device, useDeviceStore } from '@/stores/device-store'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  MQTTRouter,
  DeviceTelemetryHandler,
  DeviceTelemetryData,
} from '@/lib/mqtt-handlers'
import MqttService from '@/lib/mqtt'
import { transformDeviceData } from '@/utils/map'
import { useGetDevices } from '@/hooks/useDevices'
import { useGlobalStore } from '@/stores'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useIsDemo } from '@/hooks/useIsDemo'
import { useAuthenticated } from '@/hooks/useAuthenticated'

const Rak3DModel = '/3d-model/RAK_3D.glb'
const Tracki3DModel = '/3d-model/airtag.glb'

const PREVIEW_PATH = {
  rak: '/images/3d-preview/rak.png',
  tracki: '/images/3d-preview/airtag.png',
}

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const mqttServiceRef = useRef<MqttService | null>(null)
  const mqttRouterRef = useRef<MQTTRouter | null>(null)
  const { spaceSlug, organization } = useParams<{
    spaceSlug: string
    organization: string
  }>()
  const isDemo = useIsDemo()
  const isAuthenticated = useAuthenticated()

  const publicTopic = `tenant/${organization}/device/+/telemetry`
  const mqttTopic =
    spaceSlug && organization && !isDemo && isAuthenticated
      ? `tenant/${organization}/space/${spaceSlug}/device/+/telemetry`
      : publicTopic

  const {
    setDeviceModel,
    setInitializedSuccess,
    setDevices,
    setModelPreview,
    setDeviceState,
  } = useDeviceStore(
    useShallow((state) => ({
      setDeviceModel: state.setDeviceModel,
      setInitializedSuccess: state.setInitializedSuccess,
      setDevices: state.setDevices,
      setModelPreview: state.setModelPreview,
      setDeviceState: state.setDeviceState,
    }))
  )

  const { data: deviceSpaces, isLoading: isLoadingDevices } = useGetDevices()

  const { setGlobalLoading } = useGlobalStore(
    useShallow((state) => ({
      setGlobalLoading: state.setGlobalLoading,
    }))
  )

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

  useEffect(() => {
    // Initialize MQTT router and handlers
    mqttRouterRef.current = new MQTTRouter()

    // Register device telemetry handler (no store dependency)
    const deviceTelemetryHandler = new DeviceTelemetryHandler()
    mqttRouterRef.current.registerHandler(deviceTelemetryHandler)

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
          mqttServiceRef.current?.subscribe([mqttTopic, publicTopic])
        },
        onSubscribed: () => {
          console.log('✅ MQTT connected')
          toast.success('MQTT connected', {
            position: 'bottom-right',
          })
        },
        onDisconnect: () => {
          console.log('❌ MQTT disconnected')
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
            }
          })
        },
      })
    }
    handleMqttConnect()
  }, [])

  const getDevices = async () => {
    try {
      const devices: Device[] = transformDeviceData(deviceSpaces || [])
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

      setDeviceModel('rak', rakModel)
      setDeviceModel('tracki', trackiModel)

      setModelPreview('rak', PREVIEW_PATH.rak)
      setModelPreview('tracki', PREVIEW_PATH.tracki)

      setFetchStatus((prev) => ({
        ...prev,
        initializedModels: true,
      }))
    } catch (error) {
      console.error({ error })
    } finally {
    }
  }

  return <>{children}</>
}
