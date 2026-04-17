'use client'

import { PropsWithChildren } from 'react'
import { useMqtt } from './hooks/useMqtt'

export const DeviceProvider = ({ children }: PropsWithChildren) => {
  useMqtt()
  return <>{children}</>
}
