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
  syncGeofencesToMap: (options?: {
    forceRedraw?: boolean
  }) => Promise<void> | void
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
  syncGeofencesToMap: async (options) => {
    const forceRedraw = options?.forceRedraw ?? false
    const map = mapInstance.getMap()
    const draw = await mapInstance.initTerraDraw()
    if (!draw || !map) return

    if (!map.isStyleLoaded()) {
      if (forceRedraw) {
        map.once('idle', () => {
          get().syncGeofencesToMap({ forceRedraw: true })
        })
      }
      return
    }

    const dynamicLayouts = useLayout.getState().dynamicLayouts
    const isGeofencesActive = dynamicLayouts.includes(NavigationEnums.GEOFENCES)
    const geofences = get().geofences
    if (!isGeofencesActive || !geofences.length) {
      get().clearRendered()
      return
    }

    if (!draw.enabled) {
      draw.start()
      set({ started: true })
    }

    const { activeTool } = useGeofenceStore.getState()
    const isDrawingActive =
      !!activeTool &&
      activeTool !== 'delete' &&
      activeTool !== 'delete-selection'

    const selectedGeofence = get().selectedGeofence
    const selectedFeature = get().selectedFeature
    if (!isDrawingActive && draw.enabled) {
      draw.setMode('render')
    }
    get().clearRendered()
    const { renderIds } = get()
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

    if (forceRedraw) {
      const apiIds = features.map((f) => String(f.id))
      const toRemove = apiIds.filter((id) => draw.hasFeature(id))
      if (toRemove.length) {
        draw.removeFeatures(toRemove as FeatureId[])
      }
      draw.addFeatures(features)
      const apiIdSet = new Set(apiIds)
      set({
        renderIds: [
          ...renderIds.filter((id) => !apiIdSet.has(String(id))),
          ...features.map((f) => f.id as FeatureId),
        ],
      })
    } else {
      const existingIds = new Set(draw.getSnapshot().map((f) => String(f.id)))
      const newFeatures = features.filter(
        (f) =>
          !existingIds.has(String(f.id)) &&
          !originalGeofenceIdSets.has(String(f.id))
      )
      draw.addFeatures(newFeatures)
      set({
        renderIds: [...renderIds, ...newFeatures.map((f) => f.id as FeatureId)],
      })
    }

    if (!isDrawingActive && selectedFeature) {
      draw.setMode('select')
      draw.selectFeature(selectedFeature)
    }
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
