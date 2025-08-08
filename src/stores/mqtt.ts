/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand'

import MqttService from '@/lib/mqtt'
import { uint8ArrayToObject } from '@/utils'
import { Device } from './device-store'
import { toast } from 'sonner'

const MQTT_BROKER = 'wss://api.v0.spacedf.net:1883/mqtt'

const TOPIC = 'test/topic'

interface MQTTState {
  message: string
  isConnected: boolean
  deviceReceivedData: Record<string, Partial<Device>>
  setMessage: (msg: string) => void
  connect: () => void
  publish: (msg: string) => void
  subscribeToDevice: (deviceId: string) => void
}

// const mqttService = MqttService.getInstance(MQTT_BROKER)

// const client = mqttService.client

export const createMQTTStore = (topic?: string) => {
  // const client = mqttClient.client
  return create<MQTTState>((set) => {
    try {
      // client?.on('connect', () => {
      //   console.log('✅ MQTT connected')
      //   set({ isConnected: true })
      //   if (topic) {
      //     client?.subscribe(topic, (err) => {
      //       if (!err) console.log(`📡 Subscribed to ${topic}`)
      //     })
      //   }
      // })
      // client?.on('message', (receivedTopic, payload) => {
      //   if (receivedTopic === topic) {
      //     set({ message: payload.toString() })
      //   }
      // })
      // client?.on('error', () => {
      //   // console.error('❌ MQTT error:', err)
      // })
    } catch {}

    return {
      message: '',
      isConnected: false,
      connect: () => {},
      publish: (msg) => {},
      setMessage: (msg) => set({ message: msg }),
      // connect: () => client?.reconnect(),
      // publish: (msg) => client?.publish(TOPIC, msg, { qos: 1 }),
      deviceReceivedData: {},
      subscribeToDevice(deviceId) {
        try {
          // const deviceTopic = `device/${deviceId}`
          // client?.subscribe(deviceTopic, (err) => {
          //   if (!err) console.log(`📡 Subscribed to ${deviceId}`)
          // })
          // client?.on('message', (receivedTopic, payload) => {
          //   if (receivedTopic === deviceTopic) {
          //     const data = uint8ArrayToObject(payload)
          //     set((state) => ({
          //       deviceReceivedData: {
          //         ...state.deviceReceivedData,
          //         [deviceId]: data,
          //       },
          //     }))
          //   }
          // })
        } catch {}

        return {}
      },
    }
  })
}

interface MQTTStore {
  status: 'connected' | 'disconnected' | 'connecting'

  setStatus: (status: 'connected' | 'disconnected' | 'connecting') => void
}

export const useMqttStore = create<MQTTStore>((set, get) => {
  return {
    status: 'disconnected',

    setStatus: (status) => {
      console.log({ status })
      const previousStatus = get().status

      if (previousStatus === status) {
        toast.success('MQTT is already ' + status)
      }

      return set({ status })
    },
  }
})
