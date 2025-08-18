import {
  Dispatch,
  forwardRef,
  memo,
  SetStateAction,
  useEffect,
  useRef,
} from 'react'
import { WebRTCOptimizer, scheduleWork } from '@/utils/webrtc-optimizer'

const MAX_RETRIES = 3
const optimizer = WebRTCOptimizer.getInstance()

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
  autoPlay?: boolean
  isPlaying?: boolean
  isFullscreen?: boolean
}

const WebRTCVideo = forwardRef<HTMLVideoElement, Props>(
  ({ setConnectionState, autoPlay = true, isFullscreen = false }, videoRef) => {
    const peerRef = useRef<RTCPeerConnection | null>(null)
    const isRetryingRef = useRef<boolean>(false)
    const streamSetRef = useRef<boolean>(false)
    const retryCountRef = useRef<number>(0)
    const performanceMonitorRef = useRef<(() => void) | null>(null)

    const debouncedRetry = optimizer.debounceRetry(() => {
      cleanup()
      initializeWebRTC()
      isRetryingRef.current = false
    })

    useEffect(() => {
      initializeWebRTC()
      return () => {
        cleanup()
      }
    }, [])

    // Handle fullscreen optimizations
    useEffect(() => {
      if (videoRef && typeof videoRef !== 'function' && videoRef.current) {
        if (isFullscreen) {
          optimizer.optimizeForFullscreen(videoRef.current)
        } else {
          optimizer.resetFullscreenOptimizations(videoRef.current)
        }
      }
    }, [isFullscreen])

    async function initializeWebRTC() {
      try {
        const pc = new RTCPeerConnection(optimizer.getOptimizedRTCConfig())

        peerRef.current = pc

        pc.onconnectionstatechange = () => {
          setConnectionState(pc.connectionState)

          if (
            pc.connectionState === 'failed' ||
            pc.connectionState === 'disconnected'
          ) {
            handleRetry()
          }
        }

        pc.addTransceiver('video', optimizer.getOptimizedTransceiverConfig())

        pc.ontrack = (event) => {
          if (
            videoRef &&
            typeof videoRef !== 'function' &&
            videoRef.current &&
            event.streams.length > 0 &&
            !streamSetRef.current
          ) {
            const stream = event.streams[0]
            videoRef.current.srcObject = stream
            streamSetRef.current = true

            // Apply all optimizations
            optimizer.optimizeVideoElement(videoRef.current)

            // Apply fullscreen optimizations if needed
            if (isFullscreen) {
              optimizer.optimizeForFullscreen(videoRef.current)
            }

            // Start performance monitoring
            performanceMonitorRef.current = optimizer.monitorPerformance(
              videoRef.current
            )

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
                      // Log performance stats
                      scheduleWork(() => {
                        const stats = optimizer.getPerformanceStats()
                        console.log('📊 Performance stats:', stats)
                      })
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
      } catch {
        handleRetry()
      }
    }
    async function handleRetry() {
      if (isRetryingRef.current || retryCountRef.current >= MAX_RETRIES) return
      isRetryingRef.current = true
      retryCountRef.current++

      // Use debounced retry to prevent retry storm
      debouncedRetry()
    }

    async function cleanup() {
      // Stop performance monitoring
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current()
        performanceMonitorRef.current = null
      }

      peerRef.current?.close()
      peerRef.current = null

      if (videoRef && typeof videoRef !== 'function' && videoRef.current) {
        videoRef.current.srcObject = null
        // Reset video element styles
        videoRef.current.style.transform = ''
      }

      streamSetRef.current = false
      retryCountRef.current = 0
      optimizer.resetStats()
    }

    return (
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        playsInline
        controls={false}
        muted
        preload="none"
        className="max-h-full max-w-full object-cover"
      />
    )
  }
)

WebRTCVideo.displayName = 'WebRTCVideo'

export default memo(WebRTCVideo)
