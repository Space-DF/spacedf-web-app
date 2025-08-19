'use client'

import { useEffect, useState } from 'react'
import MqttService from '@/lib/mqtt'

const TOPIC = 'test/topic'

export const TestMQTT = () => {
  const [message, setMessage] = useState<string>('')
  const [mqttService, setMqttService] = useState<MqttService | null>(null)

  useEffect(() => {
    const service = MqttService.getInstance()
    service.initialize()
    setMqttService(service)

    // Subscribe to test topic
    service.subscribe(TOPIC, {
      callback: (topic, payload) => {
        if (topic === TOPIC) {
          setMessage(payload.toString())
        }
      },
    })

    return () => {
      service.unsubscribe(TOPIC)
    }
  }, [])

  const handlePublish = () => {
    const payload = 'Hello MQTT from React!'
    mqttService?.publish(TOPIC, payload, { qos: 1 })
  }

  console.log('rerender')

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">MQTT WebSocket in React</h2>
      <p>Received message: {message}</p>
      <button
        onClick={handlePublish}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send Message
      </button>
    </div>
  )
}
