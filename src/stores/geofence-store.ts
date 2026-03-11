import { create } from 'zustand'
import type { GeofenceForm } from '@/containers/geofences/components/upseart-geofence/schema'
import { FeatureId } from '@/types/geofence'

export type GeofenceTool =
  | 'linestring'
  | 'polygon'
  | 'rectangle'
  | 'circle'
  | 'freehand'
  | 'angled-rectangle'
  | 'sensor'
  | 'sector'
  | 'select'
  | 'delete'
  | 'delete-selection'

type GeofenceCondition = GeofenceForm['conditions'][number]

interface GeofenceStore {
  activeTool?: GeofenceTool
  isShowGeofenceControls: boolean
  currentDrawingColor: string
  currentCondition?: GeofenceCondition
  geoFencesIds: FeatureId[]
}

interface ActionsGeofenceStore {
  setActiveTool: (tool: GeofenceStore['activeTool']) => void
  setIsShowGeofenceControls: (isShow: boolean) => void
  setCurrentDrawingColor: (color: string) => void
  setCurrentCondition: (condition?: GeofenceCondition) => void
  reset: () => void
  setGeoFencesIds: (ids: FeatureId[]) => void
}

export const DEFAULT_GEOFENCE_COLOR = '#3b82f6'

export const useGeofenceStore = create<GeofenceStore & ActionsGeofenceStore>(
  (set) => ({
    geoFencesIds: [],
    activeTool: undefined,
    isShowGeofenceControls: false,
    currentDrawingColor: DEFAULT_GEOFENCE_COLOR,
    currentCondition: undefined,
    setActiveTool: (tool) => set({ activeTool: tool }),
    setIsShowGeofenceControls: (isShow) =>
      set({ isShowGeofenceControls: isShow }),
    setCurrentDrawingColor: (color) => set({ currentDrawingColor: color }),
    setCurrentCondition: (condition) => set({ currentCondition: condition }),
    reset: () =>
      set({
        activeTool: undefined,
        isShowGeofenceControls: false,
        currentDrawingColor: DEFAULT_GEOFENCE_COLOR,
        currentCondition: undefined,
        geoFencesIds: [],
      }),
    setGeoFencesIds: (ids) => set({ geoFencesIds: ids }),
  })
)
