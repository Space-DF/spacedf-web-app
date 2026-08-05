import { WATER_DEPTH_LEVEL_COLOR } from '@/constants/color'
import {
  findWaterLevelSetting,
  useMonitoringSettingStore,
} from '@/stores/monitoring-setting-store'
import {
  MonitoringColors,
  MonitoringSetting,
  MonitoringThresholds,
} from '@/types/organization'
import { hexToRgb } from './helper'

export const WATER_LEVEL_THRESHOLDS: MonitoringThresholds = {
  safe: 0.1,
  caution: 0.3,
  warning: 0.6,
}

export type WaterDepthLevelName = 'safe' | 'caution' | 'warning' | 'critical'

export type WaterDepthLevelColors = Record<
  WaterDepthLevelName,
  { primary: string; secondary: string }
>

export const CM_PER_METRE = 100

const SECONDARY_OPACITY = 0.1

const MONITORING_COLOR_KEYS: Record<
  WaterDepthLevelName,
  keyof MonitoringColors
> = {
  safe: 'safe',
  caution: 'caution',
  warning: 'warning',
  critical: 'danger',
}

const currentSetting = () =>
  findWaterLevelSetting(useMonitoringSettingStore.getState().settings)

export const getWaterLevelThresholds = (
  setting: MonitoringSetting | null = currentSetting()
): MonitoringThresholds => setting?.thresholds ?? WATER_LEVEL_THRESHOLDS

const toLevelColor = (
  hex: string,
  fallback: WaterDepthLevelColors[WaterDepthLevelName]
) => {
  try {
    const { r, g, b } = hexToRgb(hex)

    return {
      primary: hex,
      secondary: `rgba(${r}, ${g}, ${b}, ${SECONDARY_OPACITY})`,
    }
  } catch {
    return fallback
  }
}

/** Falls back to the built-in palette until the organization setting loads. */
export const getWaterDepthLevelColors = (
  setting: MonitoringSetting | null = currentSetting()
): WaterDepthLevelColors => {
  const colors = setting?.colors
  if (!colors) return WATER_DEPTH_LEVEL_COLOR

  return Object.entries(MONITORING_COLOR_KEYS).reduce(
    (levelColors, [level, colorKey]) => {
      const levelName = level as WaterDepthLevelName

      return {
        ...levelColors,
        [levelName]: toLevelColor(
          colors[colorKey],
          WATER_DEPTH_LEVEL_COLOR[levelName]
        ),
      }
    },
    {} as WaterDepthLevelColors
  )
}

/** @param waterLevel water depth in centimetres. */
export const getWaterDepthLevelName = (
  waterLevel: number,
  thresholds: MonitoringThresholds = getWaterLevelThresholds()
): WaterDepthLevelName => {
  const waterLevelMeter = waterLevel / CM_PER_METRE

  if (waterLevelMeter >= 0 && waterLevelMeter < thresholds.safe) return 'safe'

  if (
    waterLevelMeter >= thresholds.safe &&
    waterLevelMeter < thresholds.caution
  )
    return 'caution'

  if (
    waterLevelMeter >= thresholds.caution &&
    waterLevelMeter <= thresholds.warning
  )
    return 'warning'

  return 'critical'
}

export const ALERT_MESSAGES = {
  safe: 'Water level is safe',
  caution: 'Water is rising quickly',
  warning: 'Flooding',
  critical: 'Flood risk',
}
