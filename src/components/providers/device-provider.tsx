import { devices } from '@/data/dummy-data'
import { useDeviceStore } from '@/stores/device-store'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'
import React, { PropsWithChildren, useEffect } from 'react'

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  const { setDeviceModel, setDevices } = useDeviceStore()

  useEffect(() => {
    getDevice()
    initialRakModel()
    initialTrackiModel()
  }, [])

  const initialRakModel = async () => {
    try {
      const response = await fetch('/3d-model/RAK_3D.glb')
      const arrayBuffer = await response.arrayBuffer()

      const model = await load(arrayBuffer, GLTFLoader)

      setDeviceModel('rak', model)
    } catch (error) {
      console.error('Error loading RAK model:', error)
    }
  }

  const initialTrackiModel = async () => {
    try {
      const response = await fetch('/3d-model/phone-frame.glb')
      const arrayBuffer = await response.arrayBuffer()

      const model = await load(arrayBuffer, GLTFLoader)

      setDeviceModel('tracki', model)
    } catch (error) {
      console.error('Error loading tracki model:', error)
    }
  }

  const getDevice = () => {
    setDevices(devices)
  }
  return <>{children}</>
}
