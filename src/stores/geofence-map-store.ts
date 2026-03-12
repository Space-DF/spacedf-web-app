import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import type { FeatureId, Geofence } from '@/types/geofence'
import { NavigationEnums } from '@/constants'
import { toHexColor } from '@/containers/geofences/components/upseart-geofence/utils'
import { useLayout } from '@/stores/layout-store'
import { useGeofenceStore } from '@/stores/geofence-store'
import { create } from 'zustand'

const mapInstance = MapInstance.getInstance()

interface GeofenceMapStore {
  geofences: Geofence[]
  renderIds: FeatureId[]
  started: boolean
  clearRendered: () => void
  setGeofences: (geofences: Geofence[]) => void
  syncGeofencesToMap: () => void
}

export const useGeofenceMapStore = create<GeofenceMapStore>((set, get) => ({
  geofences: [],
  renderIds: [],
  started: false,
  clearRendered: () => {
    const draw = mapInstance.getTerraDraw()
    if (!draw) return

    const geofenceFeatureIds = new Set(
      get()
        .geofences.flatMap((g) =>
          g.features.map((f) => String(f.properties.id ?? ''))
        )
        .filter(Boolean)
    )

    const currentFeatureIds = get().renderIds
    const notInGeofenceFeatureIds = currentFeatureIds.filter(
      (id) => !geofenceFeatureIds.has(String(id))
    )

    const { dirtyFeatureIds, setDirtyFeatureIds } = useGeofenceStore.getState()

    const removeFeatureIds = [...dirtyFeatureIds, ...notInGeofenceFeatureIds]

    if (removeFeatureIds.length) {
      draw.removeFeatures(removeFeatureIds)
    }
    setDirtyFeatureIds([])
  },
  setGeofences: (geofences) => set({ geofences }),
  syncGeofencesToMap: () => {
    const map = mapInstance.getMap()
    const draw = mapInstance.getTerraDraw()
    if (!draw || !map || !map.isStyleLoaded()) return

    const dynamicLayouts = useLayout.getState().dynamicLayouts
    const isGeofencesActive = dynamicLayouts.includes(NavigationEnums.GEOFENCES)
    const geofences = get().geofences
    if (!isGeofencesActive || !geofences.length) {
      get().clearRendered()
      return
    }

    if (!get().started) {
      draw.start()
      set({ started: true })
    }

    draw.setMode('render')
    get().clearRendered()

    const features = geofences.flatMap((geofence) =>
      geofence.features.map((poly) => ({
        type: 'Feature' as const,
        id: poly.properties.id,
        geometry: {
          type: 'Polygon' as const,
          coordinates: poly.coordinates,
        },
        properties: {
          color: toHexColor(geofence.color),
          mode: poly.properties.mode ?? '',
          geofenceId: geofence.id,
          disabled: false,
          id: poly.properties.id ?? '',
        },
      }))
    )
    if (!features.length) return

    draw.addFeatures(features)
    set({ renderIds: features.map((f) => f.id) as FeatureId[] })
  },
}))
