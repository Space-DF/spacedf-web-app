const WATER_LEVEL_THRESHOLDS = {
  safe: 0.1,
  warning: 0.3,
  floating: 0.6,
  critical: 0.6,
}

export type WaterDepthLevelName = 'safe' | 'warning' | 'floating' | 'critical'

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
    return 'warning'

  if (
    waterLevelMeter >= WATER_LEVEL_THRESHOLDS.warning &&
    waterLevelMeter <= WATER_LEVEL_THRESHOLDS.floating
  )
    return 'floating'

  return 'critical'
}

export const ALERT_MESSAGES = {
  safe: 'Water level is safe',
  warning: 'Water level is warning',
  floating: 'Water level is floating',
  critical: 'Water level is critical',
}
