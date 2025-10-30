import {
  MQTT_BROKER,
  MQTT_PASSWORD,
  MQTT_PORT,
  MQTT_PROTOCOL,
  MQTT_USERNAME,
} from '@/shared/env'
import mqtt, { IClientOptions, MqttClient } from 'mqtt'

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
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onMessage?: (topic: string, payload: Buffer) => void
  onReconnect?: () => void
}

class MqttService {
  private static instance: MqttService
  public client: MqttClient | null = null
  private readonly brokerUrl: string
  private readonly options: IClientOptions
  private subscriptions: Map<string, MqttTopicSubscription> = new Map()
  private eventCallbacks: MqttEventCallbacks = {}
  private connectionStatus: MqttConnectionStatus = 'disconnected'

  private constructor() {
    this.brokerUrl = `${MQTT_PROTOCOL}://${MQTT_BROKER}:${MQTT_PORT}/mqtt`
    this.options = {
      clientId: `spacedf-web-app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      clean: false,
      keepalive: 30,
      reconnectPeriod: 60 * 1000,
      connectTimeout: 30 * 1000,
    }
  }

  public static getInstance(): MqttService {
    if (!MqttService.instance) {
      MqttService.instance = new MqttService()
    }
    return MqttService.instance
  }

  public initialize(): void {
    if (!this.client) {
      this.connect()
    }
  }

  public reconnect(): void {
    if (this.client) {
      this.client.reconnect()
    } else {
      this.connect()
    }
  }

  private connect(): void {
    if (this.client) return

    this.connectionStatus = 'connecting'
    this.client = mqtt.connect(this.brokerUrl, this.options)

    this.client.on('connect', () => {
      this.connectionStatus = 'connected'
      this.eventCallbacks.onConnect?.()
      this.resubscribeToTopics()
    })

    this.client.on('error', (err) => {
      this.connectionStatus = 'error'
      this.eventCallbacks.onError?.(err)
    })

    this.client.on('close', () => {
      this.connectionStatus = 'disconnected'
      this.client = null
      this.eventCallbacks.onDisconnect?.()
    })

    this.client.on('reconnect', () => {
      this.connectionStatus = 'connecting'
      this.eventCallbacks.onReconnect?.()
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
            // console.log(`📡 Resubscribed to ${topic}`)
          } else {
            console.error(`❌ Failed to resubscribe to ${topic}:`, err)
          }
        })
      }
    }
  }

  public subscribe(
    topic: string,
    options?: {
      qos?: 0 | 1 | 2
      callback?: (topic: string, payload: Buffer) => void
    }
  ): void {
    const subscription: MqttTopicSubscription = {
      topic,
      qos: options?.qos || 0,
      callback: options?.callback,
    }

    this.subscriptions.set(topic, subscription)

    if (this.client && this.connectionStatus === 'connected') {
      this.client.subscribe(topic, { qos: subscription.qos || 0 }, (err) => {
        if (!err) {
          // console.log(`📡 Subscribed to ${topic}`)
        } else {
          console.error(`❌ Failed to subscribe to ${topic}:`, err)
        }
      })
    }
  }

  public unsubscribe(topic: string): void {
    this.subscriptions.delete(topic)

    if (this.client && this.connectionStatus === 'connected') {
      this.client.unsubscribe(topic, (err) => {
        if (!err) {
          // console.log(`📡 Unsubscribed from ${topic}`)
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
    if (this.client) {
      this.client.end()
      this.client = null
      this.connectionStatus = 'disconnected'
    }
  }
}

export default MqttService
