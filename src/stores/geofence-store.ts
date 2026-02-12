import { create } from 'zustand'

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

interface GeofenceStore {
  activeTool?: GeofenceTool
  isShowGeofenceControls: boolean
  currentDrawingColor: string
}

interface ActionsGeofenceStore {
  setActiveTool: (tool: GeofenceStore['activeTool']) => void
  setIsShowGeofenceControls: (isShow: boolean) => void
  setCurrentDrawingColor: (color: string) => void
}

export const DEFAULT_GEOFENCE_COLOR = '#3b82f6'

export const useGeofenceStore = create<GeofenceStore & ActionsGeofenceStore>(
  (set) => ({
    activeTool: undefined,
    isShowGeofenceControls: false,
    currentDrawingColor: DEFAULT_GEOFENCE_COLOR,
    setActiveTool: (tool) => set({ activeTool: tool }),
    setIsShowGeofenceControls: (isShow) =>
      set({ isShowGeofenceControls: isShow }),
    setCurrentDrawingColor: (color) => set({ currentDrawingColor: color }),
  })
)
