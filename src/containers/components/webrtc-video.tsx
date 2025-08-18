import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
const MAX_RETRIES = 3

function waitForIceGathering(pc: RTCPeerConnection) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') {
      resolve(undefined)
    } else {
      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          pc.removeEventListener('icegatheringstatechange', checkState)
          resolve(undefined)
        }
      }
      pc.addEventListener('icegatheringstatechange', checkState)

      // Timeout after 3 seconds
      setTimeout(() => {
        pc.removeEventListener('icegatheringstatechange', checkState)
        resolve(undefined)
      }, 3000)
    }
  })
}

interface Props {
  setConnectionState: Dispatch<SetStateAction<RTCPeerConnectionState>>
}

export const WebRTCVideo = forwardRef<HTMLVideoElement, Props>(
  ({ setConnectionState }, videoRef) => {
    const peerRef = useRef<RTCPeerConnection | null>(null)
    const [retryCount, setRetryCount] = useState(0)
    const [isRetrying, setIsRetrying] = useState(false)
    const [streamSet, setStreamSet] = useState(false)

    useEffect(() => {
      initializeWebRTC()
      return () => {
        cleanup()
      }
    }, [])

    async function initializeWebRTC() {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:chanh-c4b5c4.hub.dev.jupyter.com.au:8555' },
            {
              urls: [
                'turn:ap-southeast-2.coturn.dev.jupyter.com.au:3478?transport=udp',
                'turn:ap-southeast-2.coturn.dev.jupyter.com.au:3478?transport=tcp',
              ],
              username: 'ap-southeast-2-dev-jupyter',
              credential: 'Z08242522ZBQHX263VIJ1',
            },
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        })

        peerRef.current = pc

        pc.ontrack = (event) => {
          if (videoRef && typeof videoRef !== 'function' && videoRef.current) {
            videoRef.current.srcObject = event.streams[0]
          }
        }

        pc.onconnectionstatechange = () => {
          setConnectionState(pc.connectionState)

          if (
            pc.connectionState === 'failed' ||
            pc.connectionState === 'disconnected'
          ) {
            handleRetry()
          }
        }

        pc.addTransceiver('video', { direction: 'recvonly' })
        pc.addTransceiver('audio', { direction: 'recvonly' })

        pc.ontrack = (event) => {
          if (
            videoRef &&
            typeof videoRef !== 'function' &&
            videoRef.current &&
            event.streams.length > 0 &&
            !streamSet
          ) {
            const stream = event.streams[0]
            videoRef.current.srcObject = stream
            // Set stream only once
            videoRef.current.srcObject = stream
            setStreamSet(true)

            const tryPlayVideo = () => {
              if (
                videoRef &&
                typeof videoRef !== 'function' &&
                videoRef.current &&
                videoRef.current.readyState >= 2
              ) {
                // HAVE_CURRENT_DATA
                const playPromise = videoRef.current.play()
                if (playPromise !== undefined) {
                  playPromise
                    .then(() => {
                      console.log('▶️ Video started playing successfully')
                    })
                    .catch((err) => {
                      console.warn(
                        '❌ Video play failed:',
                        err.name,
                        err.message
                      )
                    })
                }
              }
            }

            if (videoRef.current.readyState >= 2) {
              tryPlayVideo()
            } else {
              videoRef.current.addEventListener('canplay', tryPlayVideo, {
                once: true,
              })
            }
          }
        }

        const offer = await pc.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true,
        })
        await pc.setLocalDescription(offer)
        await waitForIceGathering(pc)
        const res = await fetch('/api/camera', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sdp: pc.localDescription?.sdp,
          }),
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()

        if (!data.sdp) {
          throw new Error('No SDP in server response')
        }

        const answer = {
          type: 'answer' as RTCSdpType,
          sdp: data.sdp as string,
        }
        await pc.setRemoteDescription(answer)
      } catch (err) {
        console.error('❌ WebRTC init error:', err)
        handleRetry()
      }
    }
    async function handleRetry() {
      if (isRetrying || retryCount >= MAX_RETRIES) return
      setIsRetrying(true)
      setRetryCount((c) => c + 1)

      const delay = Math.pow(2, retryCount + 1) * 1000

      setTimeout(() => {
        cleanup()
        initializeWebRTC()
        setIsRetrying(false)
      }, delay)
    }

    async function cleanup() {
      peerRef.current?.close()
      peerRef.current = null
      if (videoRef && typeof videoRef !== 'function' && videoRef.current) {
        videoRef.current.srcObject = null
      }
      setStreamSet(false)
    }

    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        muted
        className="max-h-full max-w-full object-contain"
      />
    )
  }
)

WebRTCVideo.displayName = 'WebRTCVideo'
