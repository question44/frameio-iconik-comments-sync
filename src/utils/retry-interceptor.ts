import {} from 'axios'
import type { AxiosInstance } from 'axios'
import type { AxiosResponse } from 'axios'
import type { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

const MAX_RETRIES = 3

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function withRateLimitInterceptor(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig & {
        __retryCount?: number
      }

      if (error.response?.status === 429) {
        config.__retryCount = config.__retryCount || 0

        if (config.__retryCount < MAX_RETRIES) {
          config.__retryCount += 1

          const retryAfterHeader = error.response.headers['retry-after']
          const retryDelay = retryAfterHeader
            ? Number.parseInt(retryAfterHeader, 10) * 1000
            : 2 ** config.__retryCount * 1000

          console.warn(
            `Request throttled. Retrying #${config.__retryCount} after ${retryDelay}ms.`,
          )

          await delay(retryDelay)
          return axiosInstance(config)
        }
      }

      return Promise.reject(error)
    },
  )
  return axiosInstance
}
