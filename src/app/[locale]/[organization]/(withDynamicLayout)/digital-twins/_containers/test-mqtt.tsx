'use client'

import { createMQTTStore } from '@/stores/mqtt'
// import client from './mqtt'

import { useShallow } from 'zustand/react/shallow'

// const TOPIC = 'test/topic'

const useMQTTStore = createMQTTStore('test/topic')

export const TestMQTT = () => {
  const { message, publish } = useMQTTStore(
    useShallow((state) => ({
      message: state.message,
      publish: state.publish,
    }))
  )

  console.log({ message })
  //   const [message, setMessage] = useState<string>('')

  //   useEffect(() => {
  //     client.subscribe(TOPIC, (err) => {
  //       if (!err) {
  //         // console.log(`📡 Subscribed to topic: ${TOPIC}`)
  //       }
  //     })

  //     client.on('message', (topic, payload) => {
  //       //   console.log(`📩 Received: ${payload.toString()} from ${topic}`)
  //       setMessage(payload.toString())
  //     })

  //     return () => {
  //       client.unsubscribe(TOPIC)
  //     }
  //   }, [])

  //   const handlePublish = () => {
  //     const payload = 'Hello MQTT from React!'
  //     client.publish(TOPIC, payload, { qos: 1 }, (err) => {
  //       if (err) {
  //         // console.error('❌ Publish error:', err)
  //       } else {
  //         // console.log(`📤 Sent: ${payload}`)
  //       }
  //     })
  //   }

  console.log('rerender')

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">MQTT WebSocket in React</h2>
      <p>Received message: {message}</p>
      <button
        onClick={() => publish('Hello MQTT from React!')}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send Message
      </button>
    </div>
  )
}
