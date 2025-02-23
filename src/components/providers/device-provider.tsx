import { useDeviceStore } from '@/stores/device-store'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'
import { PropsWithChildren, useEffect, useState } from 'react'

const Rak3DModel = '/3d-model/RAK_3D.glb'
const Tracki3DModel = '/3d-model/airtag.glb'

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const { setDeviceModel, setInitializedSuccess, setDevices } = useDeviceStore()
  const [fetchStatus, setFetchStatus] = useState({
    initializedModels: false,
    initializedDevices: false,
  })

  useEffect(() => {
    loadModels()
    getDevices()
  }, [])

  useEffect(() => {
    if (fetchStatus.initializedDevices && fetchStatus.initializedModels) {
      setTimeout(() => {
        setInitializedSuccess(true)
      }, 1000)
    }
  }, [fetchStatus.initializedDevices, fetchStatus.initializedModels])

  const loadModels = async () => {
    try {
      //add new device model to here
      const rakModelResource = fetch(Rak3DModel)
      const trackiModelResource = fetch(Tracki3DModel)

      const [rakModel, trackiModel] = await Promise.all([
        rakModelResource,
        trackiModelResource,
      ])
        .then((responses) =>
          Promise.all(
            responses.map((modelResponse) => modelResponse.arrayBuffer())
          )
        )
        .then((buffers) =>
          Promise.all(buffers.map((buffer) => load(buffer, GLTFLoader)))
        )

      setDeviceModel('rak', rakModel)
      setDeviceModel('tracki', trackiModel)

      setFetchStatus((prev) => ({
        ...prev,
        initializedModels: true,
      }))
    } catch (error) {
      console.error({ error })
    } finally {
    }
  }

  const getDevices = async () => {
    try {
      const response = await fetch('/api/devices')
      const data = await response.json()
      setDevices(data)
      setFetchStatus((prev) => ({
        ...prev,
        initializedDevices: true,
      }))
    } catch {}
  }

  return <>{children}</>
}
