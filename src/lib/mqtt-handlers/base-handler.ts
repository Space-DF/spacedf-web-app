export interface MQTTMessagePayload {
  [key: string]: any
}

export abstract class BaseMQTTHandler {
  abstract readonly topicPattern: string

  abstract canHandle(topic: string): boolean
  abstract handle(topic: string, payload: MQTTMessagePayload): any

  protected matchesWildcardPattern(topic: string, pattern: string): boolean {
    const topicParts = topic.split('/')
    const patternParts = pattern.split('/')

    if (topicParts.length !== patternParts.length) {
      return false
    }

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] !== '+' && patternParts[i] !== topicParts[i]) {
        return false
      }
    }

    return true
  }

  protected extractTopicParams(
    topic: string,
    pattern: string
  ): Record<string, string> {
    const topicParts = topic.split('/')
    const patternParts = pattern.split('/')
    const params: Record<string, string> = {}

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '+') {
        // Use the previous pattern part as the parameter name
        const paramName = patternParts[i - 1] || `param${i}`
        params[paramName] = topicParts[i]
      }
    }

    return params
  }
}
