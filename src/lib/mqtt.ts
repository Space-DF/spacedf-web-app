import mqtt, { IClientOptions, MqttClient } from 'mqtt'

const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 9)

class MqttService {
  private static instance: MqttService
  public client: MqttClient | null = null
  private readonly brokerUrl: string
  private options: IClientOptions

  private constructor(brokerUrl: string) {
    this.brokerUrl = brokerUrl
    this.options = {
      keepalive: 60,
      clientId,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 2000,
      connectTimeout: 30 * 1000,
    }
    // this.decodedUserToken()
    this.connect()
  }

  // private async decodedUserToken() {
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_DOMAIN}/api/mqtt-token`
  //     )
  //     const data = await response.json()
  //     Object.assign(this.options, {
  //       password: data.mqtt_token,
  //     })
  //   } catch {}
  // }

  private connect() {
    if (!this.client) {
      console.log({ options: this.options })
      this.client = mqtt.connect(this.brokerUrl, this.options)

      console.log({ client: this.client })

      this.client.on('connect', () => {
        console.log('Connected to MQTT broker')
      })

      this.client.on('error', (err) => {
        console.error('MQTT Connection Error:', err)
      })

      this.client.on('close', () => {
        console.log('MQTT Connection Closed')
        this.client = null // Reset client on disconnect
      })

      this.client.on('reconnect', () => {
        console.log('Reconnecting...')
      })
    }
  }

  public static getInstance(brokerUrl: string): MqttService {
    if (!MqttService.instance) {
      MqttService.instance = new MqttService(brokerUrl)
    }
    return MqttService.instance
  }
}

export default MqttService
