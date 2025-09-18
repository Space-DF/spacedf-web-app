import { useRef, useState, useEffect, useCallback } from 'react'
import { WebRTCOptimizer, scheduleWork } from '@/utils/webrtc-optimizer'

interface UseWebRTCConnectionProps {
  videoRef: React.RefObject<HTMLVideoElement>
  isFullscreen: boolean
}

const optimizer = WebRTCOptimizer.getInstance()
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

export const useWebRTCConnection = ({
  videoRef,
  isFullscreen,
}: UseWebRTCConnectionProps) => {
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>('new')
  const [showRetryButton, setShowRetryButton] = useState(false)

  const isRetryingRef = useRef<boolean>(false)
  const retryCountRef = useRef<number>(0)
  const streamSetRef = useRef<boolean>(false)
  const performanceMonitorRef = useRef<(() => void) | null>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)

  const cleanup = useCallback(
    async (resetRetryCount: boolean = false) => {
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
      if (resetRetryCount) {
        retryCountRef.current = 0
      }
      optimizer.resetStats()
    },
    [videoRef]
  )

  const initializeWebRTC = useCallback(async () => {
    try {
      const pc = new RTCPeerConnection(optimizer.getOptimizedRTCConfig())
      peerRef.current = pc

      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState)

        if (pc.connectionState === 'connected') {
          retryCountRef.current = 0
        } else if (
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

          optimizer.optimizeVideoElement(videoRef.current)

          if (isFullscreen) {
            optimizer.optimizeForFullscreen(videoRef.current)
          }

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
              const playPromise = videoRef.current.play()
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('▶️ Video started playing successfully')
                    scheduleWork(() => {
                      const stats = optimizer.getPerformanceStats()
                      console.log('📊 Performance stats:', stats)
                    })
                  })
                  .catch((err) => {
                    console.warn('❌ Video play failed:', err.name, err.message)
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
  }, [videoRef, isFullscreen])

  const debouncedRetry = optimizer.debounceRetry(() => {
    cleanup(false)
    initializeWebRTC()
    isRetryingRef.current = false
  })

  const handleRetry = useCallback(() => {
    if (isRetryingRef.current || retryCountRef.current >= MAX_RETRIES) {
      setShowRetryButton(true)
      return
    }
    setShowRetryButton(false)
    isRetryingRef.current = true
    retryCountRef.current++

    // Use debounced retry to prevent retry storm
    debouncedRetry()
  }, [debouncedRetry])

  const manualRetry = useCallback(() => {
    if (!showRetryButton) return
    cleanup(true)
    isRetryingRef.current = false
    retryCountRef.current = 0
    setShowRetryButton(false)
    handleRetry()
  }, [showRetryButton, cleanup, handleRetry])

  // Handle fullscreen optimizations
  useEffect(() => {
    if (videoRef && typeof videoRef !== 'function' && videoRef.current) {
      if (isFullscreen) {
        optimizer.optimizeForFullscreen(videoRef.current)
      } else {
        optimizer.resetFullscreenOptimizations(videoRef.current)
      }
    }
  }, [isFullscreen, videoRef])

  // Initialize WebRTC on mount
  useEffect(() => {
    initializeWebRTC()
    return () => {
      cleanup(true)
    }
  }, [initializeWebRTC, cleanup])

  return {
    connectionState,
    showRetryButton,
    manualRetry,
    cleanup,
  }
}
