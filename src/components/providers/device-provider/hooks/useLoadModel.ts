import { DEVICE_MODEL } from '@/constants/device-property'
import { useDeviceStore } from '@/stores/device-store'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'

const Rak3DModel = '/3d-model/RAK_3D.glb'
const Tracki3DModel = '/3d-model/airtag.glb'

const PREVIEW_PATH = {
  rak: '/images/3d-preview/rak.png',
  tracki: '/images/3d-preview/airtag.png',
}

export const useLoadModel = () => {
  const { setDeviceModel, setModelPreview } = useDeviceStore(
    useShallow((state) => ({
      setDeviceModel: state.setDeviceModel,
      setModelPreview: state.setModelPreview,
    }))
  )
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

      setDeviceModel(DEVICE_MODEL.RAK, rakModel)
      setDeviceModel(DEVICE_MODEL.TRACKI, trackiModel)

      setModelPreview(DEVICE_MODEL.RAK, PREVIEW_PATH.rak)
      setModelPreview(DEVICE_MODEL.TRACKI, PREVIEW_PATH.tracki)
    } catch (error) {
      console.error({ error })
    }
  }

  useEffect(() => {
    loadModels()
  }, [])
}
