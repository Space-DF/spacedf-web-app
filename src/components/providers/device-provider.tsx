import { devices } from '@/data/dummy-data'
import { useDeviceStore } from '@/stores/device-store'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'
import { PropsWithChildren, useEffect } from 'react'

const Rak3DModel = '/3d-model/RAK_3D.glb'
const Tracki3DModel = '/3d-model/airtag.glb'

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const { setDeviceModel, setDevices, setInitializedSuccess } = useDeviceStore()

  useEffect(() => {
    getDevice()
    loadModels()
  }, [])

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
    } catch (error) {
      console.error({ error })
    } finally {
      setInitializedSuccess(true)
    }
  }

  const getDevice = () => {
    setDevices(devices)
  }
  return <>{children}</>
}
