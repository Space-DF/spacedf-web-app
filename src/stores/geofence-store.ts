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
  originalGeoFencesIds: FeatureId[]
  draftGeoFencesIds: FeatureId[]
  geoFencesIds: FeatureId[]
  dirtyFeatureIds: FeatureId[]
}

interface ActionsGeofenceStore {
  setActiveTool: (tool: GeofenceStore['activeTool']) => void
  setIsShowGeofenceControls: (isShow: boolean) => void
  setCurrentDrawingColor: (color: string) => void
  setCurrentCondition: (condition?: GeofenceCondition) => void
  reset: () => void
  setOriginalGeoFencesIds: (ids: FeatureId[]) => void
  setDraftGeoFencesIds: (ids: FeatureId[]) => void
  setDirtyFeatureIds: (ids: FeatureId[]) => void
}

export const DEFAULT_GEOFENCE_COLOR = '#3b82f6'

export const useGeofenceStore = create<GeofenceStore & ActionsGeofenceStore>(
  (set) => ({
    dirtyFeatureIds: [],
    originalGeoFencesIds: [],
    activeTool: undefined,
    isShowGeofenceControls: false,
    currentDrawingColor: DEFAULT_GEOFENCE_COLOR,
    currentCondition: undefined,
    draftGeoFencesIds: [],
    geoFencesIds: [],
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
        originalGeoFencesIds: [],
        draftGeoFencesIds: [],
        geoFencesIds: [],
        dirtyFeatureIds: [],
      }),
    setOriginalGeoFencesIds: (ids) =>
      set((s) => ({
        originalGeoFencesIds: ids,
        geoFencesIds: [...ids, ...s.draftGeoFencesIds],
      })),
    setDraftGeoFencesIds: (ids) =>
      set((s) => ({
        draftGeoFencesIds: ids,
        geoFencesIds: [...s.originalGeoFencesIds, ...ids],
      })),

    setDirtyFeatureIds: (ids) => set({ dirtyFeatureIds: ids }),
  })
)
