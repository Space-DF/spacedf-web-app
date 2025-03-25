import mqtt, { IClientOptions, MqttClient } from 'mqtt'

class MqttService {
  private static instance: MqttService
  public client: MqttClient | null = null
  private readonly brokerUrl: string
  private readonly options: IClientOptions

  private constructor(brokerUrl: string) {
    this.brokerUrl = brokerUrl
    this.options = {}
    // this.decodedUserToken()
    this.connect()
  }

  //   private async decodedUserToken() {
  //     try {
  //       const response = await fetch(
  //         `${process.env.NEXT_PUBLIC_CONSOLE_API_DEV}/api/mqtt-token`
  //       )
  //       const data = await response.json()
  //     } catch {}
  //   }

  private connect() {
    if (!this.client) {
      this.client = mqtt.connect(this.brokerUrl, this.options)

      this.client.on('connect', () => {
        console.log('Connected to MQTT broker')
      })

      this.client.on('error', () => {
        // console.error('MQTT Connection Error:', err)
      })

      this.client.on('close', () => {
        // console.log('MQTT Connection Closed')
        this.client = null // Reset client on disconnect
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
