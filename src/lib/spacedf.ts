import SpaceDF from '@space-df/sdk'
import { cookies } from 'next/headers'

export class SpaceDFClient {
  private static instance: SpaceDFClient | null = null
  private client: SpaceDF | null = null
  private token: string | undefined

  private constructor() {
    this.token = undefined
  }

  private async initialize() {
    const cookieStore = await cookies()
    const organization = cookieStore.get('organization')

    this.client = new SpaceDF({
      organization: organization?.value || '',
      APIKey: 'hULY7MMjLDnkaKJmvrH9Tmhjfq7EUX6WdvVHEFpn',
    })
  }

  public static async getInstance(): Promise<SpaceDFClient> {
    if (!SpaceDFClient.instance) {
      SpaceDFClient.instance = new SpaceDFClient()
      await SpaceDFClient.instance.initialize()
    }
    return SpaceDFClient.instance
  }

  public setToken(token: string): void {
    if (!this.client) {
      throw new Error('Client is not initialized. Call getInstance first.')
    }
    this.token = token // Update the token property
    this.client.setAccessToken(token) // Update the token in the SpaceDF client
  }

  public getClient(): SpaceDF {
    if (!this.client) {
      throw new Error('Client is not initialized. Call getInstance first.')
    }
    return this.client
  }
}
