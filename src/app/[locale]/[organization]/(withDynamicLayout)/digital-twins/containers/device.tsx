import React, { memo } from 'react'
import { useLoadDeviceModel } from '../hooks/useLoadDeviceModel'

export const Device = memo(({ deviceId }: { deviceId: string }) => {
  useLoadDeviceModel(deviceId)

  return <></>
})

Device.displayName = 'Device'
