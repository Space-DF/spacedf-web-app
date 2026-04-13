'use client'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import useSWRMutation from 'swr/mutation'

export type UploadModelResult = {
  build_artifact: string
}

type UploadArg = File

export function useUploadModel() {
  const [progress, setProgress] = useState<number | null>(null)
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const cancel = useCallback(() => {
    xhrRef.current?.abort()
    xhrRef.current = null
    setProgress(null)
  }, [])

  useEffect(() => cancel, [cancel])

  const uploadModelFetcher = useCallback(
    async (url: string, { arg }: { arg: UploadArg }) => {
      cancel()
      setProgress(0)

      const formData = new FormData()
      formData.set('model', arg)

      const xhr = new XMLHttpRequest()
      xhrRef.current = xhr

      const result = await new Promise<UploadModelResult>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return
          const pct = Math.max(
            0,
            Math.min(100, (event.loaded / event.total) * 100)
          )
          setProgress(pct)
        }

        xhr.onerror = () => reject(new Error('Network error'))
        xhr.onabort = () => reject(new Error('Upload cancelled'))

        xhr.onload = () => {
          const ok = xhr.status >= 200 && xhr.status < 300
          if (!ok) {
            reject(
              new Error(xhr.responseText || `Upload failed (${xhr.status})`)
            )
            return
          }

          try {
            const json = JSON.parse(xhr.responseText) as UploadModelResult
            resolve(json)
          } catch {
            reject(new Error('Invalid server response'))
          }
        }

        xhr.open('POST', url)
        xhr.send(formData)
      })

      setProgress(null)
      xhrRef.current = null
      return result
    },
    [cancel]
  )

  const mutation = useSWRMutation<UploadModelResult, Error, string, UploadArg>(
    `/api/building?spaceSlug=${spaceSlug}`,
    uploadModelFetcher
  )

  return {
    uploadModel: mutation.trigger,
    cancel,
    progress,
    isUploading: mutation.isMutating,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
  }
}
