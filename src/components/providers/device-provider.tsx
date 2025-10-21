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
// import { useIsDemo } from '@/hooks/useIsDemo'
// import { useAuthenticated } from '@/hooks/useAuthenticated'

const Rak3DModel = '/3d-model/RAK_3D.glb'
const Tracki3DModel = '/3d-model/airtag.glb'

const PREVIEW_PATH = {
  rak: '/images/3d-preview/rak.png',
  tracki: '/images/3d-preview/airtag.png',
}

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const mqttServiceRef = useRef<MqttService | null>(null)
  const mqttRouterRef = useRef<MQTTRouter | null>(null)

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

  const { data: deviceSpaces } = useGetDevices()

  const [fetchStatus, setFetchStatus] = useState({
    initializedModels: false,
    initializedDevices: false,
  })

  // const isDemo = useIsDemo()

  // const isAuthenticated = useAuthenticated()

  // Handler for processed telemetry data
  const handleDeviceTelemetry = (data: DeviceTelemetryData) => {
    // Business logic: Update device store with parsed telemetry data
    setDeviceState(data.deviceId, data.deviceUpdate)

    // Additional business logic can be added here:
    // - Check for alerts (low battery, geofence violations)
    // - Log device activity
    // - Trigger notifications
  }

  useEffect(() => {
    // if (isDemo || !isAuthenticated) return

    // Initialize MQTT router and handlers
    mqttRouterRef.current = new MQTTRouter()

    // Register device telemetry handler (no store dependency)
    const deviceTelemetryHandler = new DeviceTelemetryHandler()
    mqttRouterRef.current.registerHandler(deviceTelemetryHandler)

    console.log(
      '📡 MQTT handlers registered:',
      mqttRouterRef.current.getRegisteredHandlers()
    )

    // Initialize MQTT connection
    mqttServiceRef.current = MqttService.getInstance()
    mqttServiceRef.current.initialize()

    mqttServiceRef.current.setEventCallbacks({
      onConnect: () => {
        console.log('✅ MQTT connected')
        // Subscribe to device telemetry (handler parses all devices)
        mqttServiceRef.current?.subscribe('device/+/telemetry')
      },
      onDisconnect: () => {
        console.log('❌ MQTT disconnected')
      },
      onError: (err) => {
        console.log('❌ MQTT error:', err)
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

    // Cleanup function to prevent memory leaks
    return () => {
      // Unsubscribe from all topics
      mqttServiceRef.current?.unsubscribe('device/+/telemetry')

      // Disconnect MQTT service
      mqttServiceRef.current?.disconnect()

      // Clear references
      mqttRouterRef.current = null
      mqttServiceRef.current = null
    }
  }, [])

  const getDevices = async () => {
    try {
      const devices: Device[] = transformDeviceData(deviceSpaces || [])
      setDevices(devices)
      setFetchStatus((prev) => ({
        ...prev,
        initializedDevices: true,
      }))
    } catch {}
  }

  useEffect(() => {
    loadModels()
    getDevices()
  }, [deviceSpaces])

  useEffect(() => {
    if (fetchStatus.initializedDevices && fetchStatus.initializedModels) {
      setTimeout(() => {
        setInitializedSuccess(true)
      }, 1000)
    }
  }, [fetchStatus.initializedDevices, fetchStatus.initializedModels])

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
