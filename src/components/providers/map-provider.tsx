'use client'

import MapInstance from '@/utils/map-instance'
import React, { PropsWithChildren, useEffect } from 'react'

const mapInstance = MapInstance.getInstance()

export const MapProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    window.mapInstance = mapInstance
    window.mapLayer = []
  }, [])
  return <>{children}</>
}
