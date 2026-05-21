import dayjs from 'dayjs'

const LAYOUT_KEYS = [
  'x',
  'y',
  'w',
  'h',
  'minW',
  'minH',
  'maxW',
  'maxH',
  'i',
] as const

/** Remove grid / identity fields before merging stored configuration into form defaults */
export function stripLayoutFromConfiguration<T extends Record<string, unknown>>(
  configuration: T
) {
  const out = { ...configuration }
  for (const k of LAYOUT_KEYS) {
    delete out[k]
  }
  delete out.type
  delete out.id
  return out
}

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    const sk = source[key as keyof Partial<T>]
    if (sk === undefined) continue
    if (Array.isArray(sk)) {
      ;(result as Record<string, unknown>)[key] = sk
    } else if (
      sk !== null &&
      typeof sk === 'object' &&
      typeof target[key as keyof T] === 'object' &&
      target[key as keyof T] !== null &&
      !Array.isArray(target[key as keyof T])
    ) {
      ;(result as Record<string, unknown>)[key] = deepMerge(
        target[key as keyof T] as Record<string, unknown>,
        sk as Record<string, unknown>
      )
    } else {
      ;(result as Record<string, unknown>)[key] = sk as unknown
    }
  }
  return result
}

/** Merge API/widget configuration into form default values for edit mode */
export function mergeFormDefaults<T extends Record<string, unknown>>(
  defaults: T,
  configuration?: Record<string, unknown> | null
): T {
  if (!configuration) return defaults
  const stripped = stripLayoutFromConfiguration(
    configuration as Record<string, unknown>
  ) as Partial<T>
  return coerceTimeframeDates(deepMerge(defaults, stripped))
}

function coerceDate(v: unknown): Date | undefined {
  if (v instanceof Date) return v
  if (typeof v === 'string' || typeof v === 'number') {
    const d = dayjs(v)
    return d.isValid() ? d.toDate() : undefined
  }
  return undefined
}
export function coerceTimeframeDates<T extends Record<string, unknown>>(
  value: T
): T {
  const tf = (value as any)?.timeframe
  if (!tf) return value

  const from = coerceDate(tf.from)
  const until = coerceDate(tf.until)

  if (!from && !until) return value

  return {
    ...(value as any),
    timeframe: {
      ...tf,
      ...(from ? { from } : {}),
      ...(until ? { until } : {}),
    },
  }
}
