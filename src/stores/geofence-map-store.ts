import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import type { Coordinate, FeatureId, Geofence } from '@/types/geofence'
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
  clearDirtyFeatureIds: () => void
  geofenceFeatureIds: FeatureId[]
  selectedGeofence?: Geofence
  setSelectedGeofence: (geofence?: Geofence) => void
  selectedFeature?: FeatureId
  setSelectedFeature: (featureId?: FeatureId) => void
}

export const useGeofenceMapStore = create<GeofenceMapStore>((set, get) => ({
  selectedFeature: undefined,
  setSelectedFeature: (featureId) => set({ selectedFeature: featureId }),
  geofences: [],
  renderIds: [],
  started: false,
  geofenceFeatureIds: [],
  selectedGeofence: undefined,
  setSelectedGeofence: (geofence) => set({ selectedGeofence: geofence }),
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

    const removeFeatureIds = notInGeofenceFeatureIds.filter(Boolean)
    if (removeFeatureIds.length) {
      removeFeatureIds.forEach((id) => {
        if (draw.hasFeature(id)) {
          draw.removeFeatures([id])
        }
      })
    }
  },
  setGeofences: (geofences) =>
    set({
      geofences,
      geofenceFeatureIds: geofences
        .flatMap((g) => g.features.map((f) => String(f.properties.id ?? '')))
        .filter(Boolean),
    }),
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

    const selectedGeofence = get().selectedGeofence
    const selectedFeature = get().selectedFeature
    draw.setMode('render')
    get().clearRendered()
    const { renderIds } = get()
    const existingIds = new Set(draw.getSnapshot().map((f) => String(f.id)))
    const features = geofences.flatMap((geofence) => {
      return geofence.features.map((poly) => ({
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
          disabled: selectedGeofence
            ? selectedGeofence.id !== geofence.id
            : false,
          id: poly.properties.id ?? '',
        },
      }))
    })
    const { originalGeoFencesIds } = useGeofenceStore.getState()
    const originalGeofenceIdSets = new Set(
      originalGeoFencesIds.map((id) => String(id))
    )

    if (!features.length) return
    const newFeatures = features.filter(
      (f) =>
        !existingIds.has(String(f.id)) &&
        !originalGeofenceIdSets.has(String(f.id))
    )
    draw.addFeatures(newFeatures)
    if (selectedFeature) {
      draw.setMode('select')
      draw.selectFeature(selectedFeature)
    }
    set({
      renderIds: [...renderIds, ...newFeatures.map((f) => f.id as FeatureId)],
    })
  },

  clearDirtyFeatureIds: () => {
    const draw = mapInstance.getTerraDraw()
    if (!draw) return
    const { originalGeoFencesIds } = useGeofenceStore.getState()
    const geofences = get().geofences
    const geofencesByFeatureId = new Map<
      string,
      {
        geometry: {
          type: 'Polygon'
          coordinates: Coordinate[][]
        }
        properties: {
          mode: string
          geofenceId: string
          disabled: boolean
          id: string
          color: string
        }
      }
    >()

    geofences.forEach((geofence) => {
      const hexColor = toHexColor(geofence.color)
      geofence.features.forEach((poly) => {
        const id = String(poly.properties.id ?? '')
        if (!id) return
        geofencesByFeatureId.set(id, {
          geometry: {
            type: 'Polygon',
            coordinates: poly.coordinates,
          },
          properties: {
            mode: poly.properties.mode ?? 'polygon',
            geofenceId: geofence.id,
            disabled: false,
            id: poly.properties.id ?? '',
            color: hexColor,
          },
        })
      })
    })

    originalGeoFencesIds.forEach((id) => {
      const key = String(id ?? '')
      const entry = geofencesByFeatureId.get(key)
      if (!entry) return
      if (!draw.hasFeature(id)) {
        draw.addFeatures([
          {
            type: 'Feature',
            id,
            geometry: {
              type: 'Polygon',
              coordinates: entry.geometry.coordinates,
            },
            properties: entry.properties,
          },
        ])
        return
      }
      draw.updateFeatureGeometry(id, {
        coordinates: entry.geometry.coordinates,
        type: 'Polygon',
      })
      draw.updateFeatureProperties(id, {
        color: entry.properties.color,
        disabled: false,
      })
    })
  },
}))
