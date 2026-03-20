import { ZodError } from 'zod'
import YAML from 'yaml'
import { GeofenceForm, ruleSchema } from '../../../../schema'

type Condition = GeofenceForm['conditions'][number]

function formatZodErrors(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
      return `${path}${issue.message}`
    })
    .join('\n')
}

export function parseAndValidateYaml(
  yamlStr: string,
  fallbackError: string
): { success: true; data: Condition } | { success: false; error: string } {
  try {
    const raw = YAML.parse(yamlStr)
    if (!raw || typeof raw !== 'object') {
      return { success: false, error: fallbackError }
    }
    const result = ruleSchema.safeParse(raw)
    if (!result.success) {
      return { success: false, error: formatZodErrors(result.error) }
    }
    return { success: true, data: result.data as Condition }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : fallbackError,
    }
  }
}
