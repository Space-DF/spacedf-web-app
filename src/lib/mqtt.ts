import {
  MQTT_BROKER,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_PROTOCOL,
  MQTT_USERNAME,
} from '@/shared/env'
import mqtt, { IClientOptions, MqttClient } from 'mqtt'
import api from './api'
import { sleep } from '@/utils'

export type MqttConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'

export interface MqttTopicSubscription {
  topic: string
  qos?: 0 | 1 | 2
  callback?: (topic: string, payload: Buffer) => void
}

export interface MqttEventCallbacks {
  onSubscribed?: () => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onMessage?: (topic: string, payload: Buffer) => void
  onReconnect?: () => void
}

const getMqttToken = async () =>
  api.get<{ mqtt_token: string }>('/api/mqtt-token')

class MqttService {
  private static instance: MqttService
  public client: MqttClient | null = null
  private readonly brokerUrl: string
  private readonly options: IClientOptions
  private subscriptions: Map<string, MqttTopicSubscription> = new Map()
  private eventCallbacks: MqttEventCallbacks = {}
  private connectionStatus: MqttConnectionStatus = 'disconnected'
  private isReconnecting = false
  private manualDisconnect = false
  private connectRetryCount = 0
  private readonly maxConnectRetries = 3

  private constructor(organization: string) {
    this.brokerUrl = `${MQTT_PROTOCOL}://${MQTT_BROKER}:${MQTT_PORT}/mqtt`
    this.options = {
      clientId: `spacedf-web-app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clean: false,
      keepalive: 30,
      reconnectPeriod: 0,
      connectTimeout: 30 * 1000,
      properties: {
        userProperties: {
          organization: organization,
        },
      },
      protocolVersion: 5,
    }
  }

  public static getInstance(organization: string): MqttService {
    if (!MqttService.instance) {
      MqttService.instance = new MqttService(organization)
    }
    return MqttService.instance
  }

  public async initialize(): Promise<void> {
    if (!this.client) {
      await this.connect()
    }
  }

  public async reconnect(): Promise<void> {
    this.connectRetryCount = 0
    this.client?.end()
    this.client = null
    await this.connect()
  }

  private async connect(): Promise<void> {
    if (this.client) return
    const mqttToken = await getMqttToken()
    this.connectionStatus = 'connecting'
    const options = {
      ...this.options,
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
    }
    if (mqttToken?.mqtt_token) {
      options.username = mqttToken.mqtt_token
      options.password = ''
    }
    this.client = mqtt.connect(this.brokerUrl, options)

    this.client.on('connect', () => {
      this.manualDisconnect = false
      this.connectionStatus = 'connected'
      this.connectRetryCount = 0
      this.eventCallbacks.onConnect?.()
      this.resubscribeToTopics()
    })

    this.client.on('error', (err) => {
      this.connectionStatus = 'error'
      this.connectRetryCount++
      this.eventCallbacks.onError?.(err)
    })

    this.client.on('close', async () => {
      if (this.manualDisconnect) return

      this.connectionStatus = 'disconnected'
      this.client?.end()
      this.client = null

      if (this.isReconnecting) return
      this.isReconnecting = true

      if (this.connectRetryCount < this.maxConnectRetries) {
        await sleep(1000)
        await this.connect()
        this.isReconnecting = false
      }
    })

    this.client.on('offline', () => {
      this.connectionStatus = 'disconnected'
    })

    this.client.on('message', (topic, payload) => {
      this.eventCallbacks.onMessage?.(topic, payload)
      const subscription =
        this.subscriptions.get(topic) || this.findWildcardSubscription(topic)
      subscription?.callback?.(topic, payload)
    })
  }

  private findWildcardSubscription(
    topic: string
  ): MqttTopicSubscription | undefined {
    const subscriptionTopics = Array.from(this.subscriptions.keys())
    for (const subscriptionTopic of subscriptionTopics) {
      if (this.topicMatches(subscriptionTopic, topic)) {
        return this.subscriptions.get(subscriptionTopic)
      }
    }
    return undefined
  }

  private topicMatches(pattern: string, topic: string): boolean {
    const patternParts = pattern.split('/')
    const topicParts = topic.split('/')

    if (patternParts.length !== topicParts.length && !pattern.includes('#')) {
      return false
    }

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]
      const topicPart = topicParts[i]

      if (patternPart === '#') {
        return true
      }
      if (patternPart !== '+' && patternPart !== topicPart) {
        return false
      }
    }

    return true
  }

  private resubscribeToTopics(): void {
    if (!this.client) return

    const subscriptionTopics = Array.from(this.subscriptions.keys())
    for (const topic of subscriptionTopics) {
      const subscription = this.subscriptions.get(topic)
      if (subscription) {
        this.client.subscribe(topic, { qos: subscription.qos || 0 }, (err) => {
          if (!err) {
            console.log(`📡 Resubscribed to ${topic}`)
          } else {
            console.error(`❌ Failed to resubscribe to ${topic}:`, err)
          }
        })
      }
    }
  }

  public subscribe(
    topic: string | string[],
    options?: {
      qos?: 0 | 1 | 2
      callback?: (topic: string, payload: Buffer) => void
    }
  ): void {
    const topics = Array.isArray(topic) ? topic : [topic]
    const qos = options?.qos || 0
    let subscribed = true
    topics.forEach((singleTopic, index) => {
      const subscription: MqttTopicSubscription = {
        topic: singleTopic,
        qos,
        callback: options?.callback,
      }

      this.subscriptions.set(singleTopic, subscription)

      if (this.client && this.connectionStatus === 'connected') {
        this.client.subscribe(singleTopic, { qos }, (err) => {
          if (!err) {
            console.log(`📡 Subscribed to ${singleTopic}`)
            if (index === topics.length - 1 && subscribed) {
              this.eventCallbacks.onSubscribed?.()
            }
          } else {
            console.error(`❌ Failed to subscribe to ${singleTopic}:`, err)
            subscribed = false
          }
        })
      }
    })
  }

  public unsubscribe(topic: string): void {
    this.subscriptions.delete(topic)

    if (this.client && this.connectionStatus === 'connected') {
      this.client.unsubscribe(topic, (err) => {
        if (!err) {
          console.log(`📡 Unsubscribed from ${topic}`)
        } else {
          console.error(`❌ Failed to unsubscribe from ${topic}:`, err)
        }
      })
    }
  }

  public publish(
    topic: string,
    message: string | Buffer,
    options?: { qos?: 0 | 1 | 2; retain?: boolean }
  ): void {
    if (this.client && this.connectionStatus === 'connected') {
      this.client.publish(
        topic,
        message,
        {
          qos: options?.qos || 0,
          retain: options?.retain || false,
        },
        (err) => {
          if (err) {
            console.error(`❌ Failed to publish to ${topic}:`, err)
          }
        }
      )
    } else {
      console.warn('⚠️ Cannot publish: MQTT client not connected')
    }
  }

  public setEventCallbacks(callbacks: MqttEventCallbacks): void {
    this.eventCallbacks = { ...this.eventCallbacks, ...callbacks }
  }

  public getConnectionStatus(): MqttConnectionStatus {
    return this.connectionStatus
  }

  public getSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys())
  }

  public disconnect(): void {
    this.manualDisconnect = true
    if (this.client) {
      this.client.end()
      this.client = null
      this.connectionStatus = 'disconnected'
    }
  }
}

export default MqttService
