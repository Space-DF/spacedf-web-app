import { getClientOrganization } from '@/utils'
import { getServerOrganization } from '@/utils/server-actions'
import SpaceDF from '@space-df/sdk'

export class SpaceDFClient {
  private static instance: SpaceDFClient | null = null
  private client: SpaceDF | null = null
  private token?: string | undefined
  private api_key: string

  private constructor() {
    this.token = undefined
    this.api_key = process.env.SPACE_API_KEY || ''
  }

  private async initialize() {
    let organization = ''

    if (typeof window !== 'undefined') {
      organization = await getClientOrganization()
    } else {
      organization = await getServerOrganization()
    }

    this.client = new SpaceDF({
      organization: organization || '',
      APIKey: this.api_key,
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

  public setAPIKey(apiKey: string): void {
    this.api_key = apiKey
  }

  public getToken(): string {
    return this.token || ''
  }

  public getClient(): SpaceDF {
    if (!this.client) {
      throw new Error('Client is not initialized. Call getInstance first.')
    }
    return this.client
  }
}

export const spaceClient = async () => {
  const spacedfSDK = await SpaceDFClient.getInstance()

  return spacedfSDK.getClient()
}
