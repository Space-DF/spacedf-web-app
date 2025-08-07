import { MQTT_PASSWORD, MQTT_USERNAME } from '@/shared/env'
import { useDeviceStore } from '@/stores/device-store'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'
import mqtt, { MqttClient } from 'mqtt'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { MQTTRouter, DeviceTelemetryHandler } from '@/lib/mqtt-handlers'

const Rak3DModel = '/3d-model/RAK_3D.glb'
const Tracki3DModel = '/3d-model/airtag.glb'

const PREVIEW_PATH = {
  rak: '/images/3d-preview/rak.png',
  tracki: '/images/3d-preview/airtag.png',
}

const MQTT_BROKER = 'ws://api.v0.spacedf.net:8083/mqtt'
// const mqttService = MqttService.getInstance(MQTT_BROKER)
// const client = mqttService.client

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const [client, setClient] = useState<MqttClient | null>(null)
  const mqttRouterRef = useRef<MQTTRouter | null>(null)

  const { setDeviceModel, setInitializedSuccess, setDevices, setModelPreview } =
    useDeviceStore(
      useShallow((state) => ({
        setDeviceModel: state.setDeviceModel,
        setInitializedSuccess: state.setInitializedSuccess,
        setDevices: state.setDevices,
        setModelPreview: state.setModelPreview,
      }))
    )
  const [fetchStatus, setFetchStatus] = useState({
    initializedModels: false,
    initializedDevices: false,
  })

  const mqttConnect = () => {
    setClient(
      mqtt.connect(MQTT_BROKER, {
        clientId: 'spacedf-web-app-121212',
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD,
        clean: true,
        keepalive: 60,
        reconnectPeriod: 60 * 60 * 1000,
        connectTimeout: 30 * 1000,
      })
    )
  }

  useEffect(() => {
    // Initialize MQTT router and handlers
    mqttRouterRef.current = new MQTTRouter()

    // Register device telemetry handler with entire store
    const deviceTelemetryHandler = new DeviceTelemetryHandler(useDeviceStore)
    mqttRouterRef.current.registerHandler(deviceTelemetryHandler)

    console.log(
      '📡 MQTT handlers registered:',
      mqttRouterRef.current.getRegisteredHandlers()
    )

    mqttConnect()
  }, [])

  useEffect(() => {
    loadModels()
    getDevices()
  }, [])

  useEffect(() => {
    if (client) {
      const onConnect = () => {
        console.log('✅ MQTT connected')
        client.subscribe('device/+/telemetry', (err) => {
          if (!err) console.log('📡 Subscribed to device/+/telemetry')
        })
      }

      const onMessage = (topic: string, payload: Buffer) => {
        // Route message through the strategy pattern
        mqttRouterRef.current?.routeMessage(topic, payload)
      }

      client.on('connect', onConnect)
      client.on('message', onMessage)

      return () => {
        client.removeListener('connect', onConnect)
        client.removeListener('message', onMessage)
      }
    }
  }, [client])

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

  const getDevices = async () => {
    try {
      const response = await fetch('/api/devices')
      const data = await response.json()
      setDevices(data)
      setFetchStatus((prev) => ({
        ...prev,
        initializedDevices: true,
      }))
    } catch {}
  }

  return <>{children}</>
}
