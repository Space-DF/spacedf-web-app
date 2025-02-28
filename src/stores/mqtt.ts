import { create } from 'zustand'

import MqttService from '@/lib/mqtt'
import { uint8ArrayToObject } from '@/utils'
import { Device } from './device-store'

// const MQTT_BROKER = 'ws://api.v0.spacedf.net:1883/mqtt'
const MQTT_BROKER = 'ws://192.168.1.26:9001/mqtt'
const TOPIC = '/test'

interface MQTTState {
  message: string
  isConnected: boolean
  deviceReceivedData: Record<string, Partial<Device>>
  setMessage: (msg: string) => void
  connect: () => void
  publish: (msg: string) => void
  subscribeToDevice: (deviceId: string) => void
}

const mqttService = MqttService.getInstance(MQTT_BROKER)

const client = mqttService.client

export const createMQTTStore = (topic?: string) => {
  // const client = mqttClient.client
  return create<MQTTState>((set) => {
    try {
      client?.on('connect', () => {
        console.log('✅ MQTT connected')
        set({ isConnected: true })

        if (topic) {
          client?.subscribe(topic, (err) => {
            if (!err) console.log(`📡 Subscribed to ${topic}`)
          })
        }
      })

      client?.on('message', (receivedTopic, payload) => {
        if (receivedTopic === topic) {
          set({ message: payload.toString() })
        }
      })

      client?.on('error', (err) => {
        console.error('❌ MQTT error:', err)
      })
    } catch {}

    return {
      message: '',
      isConnected: false,
      setMessage: (msg) => set({ message: msg }),
      connect: () => client?.reconnect(),
      publish: (msg) => client?.publish(TOPIC, msg, { qos: 1 }),
      deviceReceivedData: {},
      subscribeToDevice(deviceId) {
        try {
          const deviceTopic = `device/${deviceId}`
          client?.subscribe(deviceTopic, (err) => {
            if (!err) console.log(`📡 Subscribed to ${deviceId}`)
          })

          client?.on('message', (receivedTopic, payload) => {
            if (receivedTopic === deviceTopic) {
              const data = uint8ArrayToObject(payload)

              set((state) => ({
                deviceReceivedData: {
                  ...state.deviceReceivedData,
                  [deviceId]: data,
                },
              }))
            }
          })
        } catch {}
      },
    }
  })
}
