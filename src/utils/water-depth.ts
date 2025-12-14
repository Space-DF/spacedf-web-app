const WATER_LEVEL_THRESHOLDS = {
  safe: 0.1,
  warning: 0.3,
  floating: 0.6,
  critical: 0.6,
}

export type WaterDepthLevelName = 'safe' | 'caution' | 'warning' | 'critical'

export const getWaterDepthLevelName = (
  waterLevel: number
): WaterDepthLevelName => {
  const waterLevelMeter = waterLevel / 100

  if (waterLevelMeter >= 0 && waterLevelMeter < WATER_LEVEL_THRESHOLDS.safe)
    return 'safe'

  if (
    waterLevelMeter >= WATER_LEVEL_THRESHOLDS.safe &&
    waterLevelMeter < WATER_LEVEL_THRESHOLDS.warning
  )
    return 'caution'

  if (
    waterLevelMeter >= WATER_LEVEL_THRESHOLDS.warning &&
    waterLevelMeter <= WATER_LEVEL_THRESHOLDS.floating
  )
    return 'warning'

  return 'critical'
}

export const ALERT_MESSAGES = {
  safe: 'Water level is safe',
  caution: 'Water level is caution',
  warning: 'Water level is warning',
  critical: 'Water level is critical',
}
