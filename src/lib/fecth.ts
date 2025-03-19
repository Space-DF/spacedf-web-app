import { NEXT_PUBLIC_CONSOLE_API } from '@/shared/env'

interface FetchOptions extends RequestInit {}
type Headers = Pick<FetchOptions, 'headers'>['headers']

export type FullResponse<TResponse = any> = {
  status: Response['status']
  response_data: TResponse
}

export class FetchAPI {
  // protected async
  private headers: Headers = {
    // "Access-Control-Allow-Origin": "*",
    'Content-Type': 'application/json',
  }

  constructor(options: Headers = {}) {
    this.headers = {
      ...this.headers,
      ...options,
    }
  }

  private mainURL = NEXT_PUBLIC_CONSOLE_API as RequestInfo | URL

  setURL(url: string) {
    this.mainURL = url
  }

  setHeader(headers: Headers = {}) {
    this.headers = {
      ...this.headers,
      ...headers,
    }
  }

  //pls changes the configuration following the API format
  async handleError(response: Response) {
    const responseJson: any = await response.json()

    const error: any = new Error('An error occurred while sending data.')

    error.code = responseJson?.code || null
    error.status = response?.status || 400
    error.message = responseJson || 'Something went wrong'

    throw error
  }

  async get<T = any>(
    url: string,
    options: FetchOptions = {}
  ): Promise<FullResponse<T>> {
    const mergedOptions: FetchOptions = {
      ...options,
      headers: {
        ...this.headers,
        ...(options.headers || {}),
      },
    }

    const response = await fetch(`${this.mainURL}/${url}`, {
      method: 'GET',
      ...mergedOptions,
    })

    if (!response.ok && response.status !== 204) {
      await this.handleError(response)
    }

    return {
      status: response.status,
      response_data: await response.json(),
    }
  }

  private getDomain = (url: string): RequestInfo | URL => {
    if (!url) return this.mainURL

    return `${this.mainURL}/${url}`
  }

  async post<T = any>(
    url: string,
    payload: Record<string, any> | null,
    options: FetchOptions = {}
  ): Promise<FullResponse<T>> {
    const mergedOptions: FetchOptions = {
      body: payload ? JSON.stringify(payload) : '',
      ...options,
      headers: {
        ...this.headers,
        ...(options.headers || {}),
      },
    }

    console.log(this.getDomain(url))

    const response = await fetch(this.getDomain(url), {
      method: 'POST',
      ...mergedOptions,
    })

    if (!response.ok) {
      await this.handleError(response)
    }

    if (response.status === 204) return response as any

    return {
      status: response.status,
      response_data: await response.json(),
    }
  }

  async put<T = any>(
    url: string,
    payload: Record<string, any> | null,
    options: FetchOptions = {}
  ): Promise<FullResponse<T>> {
    const mergedOptions: FetchOptions = {
      body: payload ? JSON.stringify(payload) : '',
      ...options,
      headers: {
        ...this.headers,
        ...(options.headers || {}),
      },
    }

    console.log(this.getDomain(url))

    const response = await fetch(this.getDomain(url), {
      method: 'PUT',
      ...mergedOptions,
    })

    if (!response.ok) {
      await this.handleError(response)
    }

    if (response.status === 204) return response as any

    return {
      status: response.status,
      response_data: await response.json(),
    }
  }

  async patch<T = any>(
    url: string,
    payload: Record<string, any> | null,
    options: FetchOptions = {}
  ): Promise<FullResponse<T>> {
    const mergedOptions: FetchOptions = {
      body: payload ? JSON.stringify(payload) : '',
      ...options,
      headers: {
        ...this.headers,
        ...(options.headers || {}),
      },
    }

    console.log(this.getDomain(url))

    const response = await fetch(this.getDomain(url), {
      method: 'PATCH',
      ...mergedOptions,
    })

    if (!response.ok) {
      await this.handleError(response)
    }

    if (response.status === 204) return response as any

    return {
      status: response.status,
      response_data: await response.json(),
    }
  }

  async delete<T = any>(
    url: string,
    options: FetchOptions = {}
  ): Promise<FullResponse<T>> {
    const mergedOptions: FetchOptions = {
      ...options,
      headers: {
        ...this.headers,
        ...(options.headers || {}),
      },
    }

    const response = await fetch(`${this.mainURL}/${url}`, {
      method: 'DELETE',
      ...mergedOptions,
    })

    if (!response.ok) {
      await this.handleError(response)
    }

    return {
      status: response.status,
      response_data: await response.json(),
    }
  }
}
