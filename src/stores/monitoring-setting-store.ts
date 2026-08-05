import { MonitoringSetting, MonitoringType } from '@/types/organization'
import { create } from 'zustand'

type MonitoringSettingStore = {
  settings: MonitoringSetting[]
  setSettings: (settings: MonitoringSetting[]) => void
}

const WATER_LEVEL_MONITORING_TYPE: MonitoringType = 'water_level'

export const useMonitoringSettingStore = create<MonitoringSettingStore>(
  (set) => ({
    settings: [],
    setSettings: (settings) => set({ settings }),
  })
)

export const findWaterLevelSetting = (
  settings: MonitoringSetting[]
): MonitoringSetting | null =>
  settings.find((setting) => setting.type === WATER_LEVEL_MONITORING_TYPE) ??
  null

export const useWaterLevelSetting = () =>
  useMonitoringSettingStore((state) => findWaterLevelSetting(state.settings))
