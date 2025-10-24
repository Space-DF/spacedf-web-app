import { signOut } from 'next-auth/react'

type RequestConfig = RequestInit & {
  baseURL?: string
  timeout?: number
}

type Interceptor = {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onResponse?: (response: Response) => Response | Promise<Response>
  onError?: (error: Error) => Promise<never>
}

type RequestError = Error & {
  response?: Response
  config?: RequestConfig
}

class FetchInstance {
  private interceptors: Interceptor = {}
  private timeout: number
  private lastRequest?: { url: string; config: RequestConfig }
  private refreshTokenPromise: Promise<boolean> | null = null
  private pendingRequests: Array<() => void> = []

  constructor(config: { baseURL: string; timeout?: number }) {
    this.timeout = config.timeout || 30000
  }

  setInterceptors(interceptors: Interceptor) {
    this.interceptors = interceptors
  }

  private async waitForRefreshToken(): Promise<void> {
    return new Promise((resolve) => {
      this.pendingRequests.push(resolve)
    })
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestConfig
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    try {
      this.lastRequest = { url: endpoint, config }
      let requestConfig = { ...config }
      if (this.interceptors.onRequest) {
        requestConfig = await this.interceptors.onRequest(requestConfig)
      }
      const response = await this.fetchWithTimeout(endpoint, requestConfig)

      // Apply response interceptor
      let interceptedResponse = response
      if (this.interceptors.onResponse) {
        interceptedResponse = await this.interceptors.onResponse(response)
      }

      if (!interceptedResponse.ok) {
        const errorData = await interceptedResponse.json()
        const error = new Error(
          errorData.message || errorData.detail || 'Request failed'
        ) as RequestError
        error.response = interceptedResponse
        error.config = requestConfig
        Object.assign(error, {
          status: interceptedResponse.status,
          statusText: interceptedResponse.statusText,
          data: errorData,
        })
        throw error
      }

      return interceptedResponse.json()
    } catch (error) {
      if (this.interceptors.onError) {
        return this.interceptors.onError(error as RequestError)
      }
      throw error
    }
  }

  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    const isFormData = data instanceof FormData
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData
        ? config?.headers
        : {
            'Content-Type': 'application/json',
            ...config?.headers,
          },
    })
  }

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    const isFormData = data instanceof FormData
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData
        ? config?.headers
        : {
            'Content-Type': 'application/json',
            ...config?.headers,
          },
    })
  }

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    const isFormData = data instanceof FormData
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData
        ? config?.headers
        : {
            'Content-Type': 'application/json',
            ...config?.headers,
          },
    })
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

export const api = new FetchInstance({
  baseURL: '',
  timeout: 30000,
})

api.setInterceptors({
  onRequest: async (config) => {
    return config
  },
  onResponse: async (response) => {
    return response
  },
  onError: async (error: RequestError) => {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      signOut({ redirect: false })
      window.location.href = '/'
    }
    throw error
  },
})

export default api
