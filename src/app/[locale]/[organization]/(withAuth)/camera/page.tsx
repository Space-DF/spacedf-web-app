'use client'
import React, { useEffect, useRef, useState } from 'react'
const media = 'video+audio'
const maxRetries = 3

function waitForIceGathering(pc: any) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') {
      resolve()
    } else {
      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          pc.removeEventListener('icegatheringstatechange', checkState)
          resolve()
        }
      }
      pc.addEventListener('icegatheringstatechange', checkState)

      // Timeout after 3 seconds
      setTimeout(() => {
        pc.removeEventListener('icegatheringstatechange', checkState)
        resolve()
      }, 3000)
    }
  })
}
export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [connectionState, setConnectionState] = useState<string>('new')
  const [isLoading, setIsLoading] = useState(true)
  const [hasStream, setHasStream] = useState(false)
  const [trackStates, setTrackStates] = useState<any[]>([])
  const [streamSet, setStreamSet] = useState(false)
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false)

  useEffect(() => {
    initializeWebRTC()
    return () => {
      cleanup()
    }
  }, [])

  async function initializeWebRTC() {
    try {
      setIsLoading(true)
      console.log('🚀 Initializing WebRTC connection...')

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

      // Add event listeners for debugging
      pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', pc.iceConnectionState)
      }

      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0]
          console.log('📺 On track:', event.track.kind)
        }
      }

      pc.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', pc.connectionState)
        setConnectionState(pc.connectionState)

        if (pc.connectionState === 'connected') {
          setIsLoading(false)
        } else if (
          pc.connectionState === 'failed' ||
          pc.connectionState === 'disconnected'
        ) {
          handleRetry()
        }
      }

      pc.onicegatheringstatechange = () => {
        console.log('❄️ ICE gathering state:', pc.iceGatheringState)
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🎯 ICE candidate:', event.candidate)
        } else {
          console.log('✅ ICE gathering complete')
        }
      }

      if (media.includes('video')) {
        pc.addTransceiver('video', { direction: 'recvonly' })
        console.log('📹 Added video transceiver')
      }
      if (media.includes('audio')) {
        pc.addTransceiver('audio', { direction: 'recvonly' })
        console.log('🔊 Added audio transceiver')
      }

      pc.ontrack = (event) => {
        console.log(
          '📺 Received track:',
          event.track.kind,
          event.streams.length,
          'streams'
        )
        if (videoRef.current && event.streams.length > 0 && !streamSet) {
          const stream = event.streams[0]
          videoRef.current.srcObject = stream
          console.log('📦 Stream details:', {
            id: stream.id,
            active: stream.active,
            tracks: stream.getTracks().map((track) => ({
              kind: track.kind,
              enabled: track.enabled,
              readyState: track.readyState,
              id: track.id,
              muted: track.muted,
            })),
          })

          // Monitor track muted state changes and update UI
          const updateTrackStates = () => {
            const tracks = stream.getTracks().map((track) => ({
              kind: track.kind,
              enabled: track.enabled,
              readyState: track.readyState,
              muted: track.muted,
              id: track.id,
            }))
            setTrackStates(tracks)
          }

          stream.getTracks().forEach((track) => {
            track.onmute = () => {
              console.log(`🔇 Track ${track.kind} muted`)
              updateTrackStates()
            }
            track.onunmute = () => {
              console.log(
                `🔊 Track ${track.kind} unmuted - video should appear now!`
              )
              updateTrackStates()
            }
            track.onended = () => {
              console.log(`❌ Track ${track.kind} ended`)
              updateTrackStates()
            }
          })

          // Initial track states
          updateTrackStates()

          // Set stream only once
          videoRef.current.srcObject = stream
          setStreamSet(true)
          setHasStream(true)
          console.log('✅ Video element srcObject set')

          // Wait for video to be ready before playing
          const tryPlayVideo = () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              // HAVE_CURRENT_DATA
              const playPromise = videoRef.current.play()
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('▶️ Video started playing successfully')
                  })
                  .catch((err) => {
                    console.warn('❌ Video play failed:', err.name, err.message)
                    if (err.name === 'NotAllowedError') {
                      // Browser autoplay policy - need user interaction
                      setNeedsUserInteraction(true)
                      const playOnClick = () => {
                        videoRef.current?.play().then(() => {
                          setNeedsUserInteraction(false)
                        })
                        document.removeEventListener('click', playOnClick)
                      }
                      document.addEventListener('click', playOnClick, {
                        once: true,
                      })
                      console.log('Click anywhere to start video')
                    }
                  })
              }
            }
          }

          // Try to play immediately if ready, otherwise wait for canplay event
          if (videoRef.current.readyState >= 2) {
            tryPlayVideo()
          } else {
            videoRef.current.addEventListener('canplay', tryPlayVideo, {
              once: true,
            })
          }

          // Additional debug for video element
          videoRef.current.onloadedmetadata = () => {
            console.log('📹 Video metadata loaded:', {
              videoWidth: videoRef.current?.videoWidth,
              videoHeight: videoRef.current?.videoHeight,
              duration: videoRef.current?.duration,
            })
          }

          videoRef.current.oncanplay = () => {
            console.log('▶️ Video can play')
          }

          videoRef.current.onplaying = () => {
            console.log('🎬 Video is now playing')
          }

          videoRef.current.onpause = () => {
            console.log('⏸️ Video paused')
          }

          videoRef.current.onerror = (e) => {
            console.error('❌ Video element error:', e)
          }

          videoRef.current.onloadstart = () => {
            console.log('🔄 Video load started')
          }

          videoRef.current.onwaiting = () => {
            console.log('⏳ Video waiting for data')
          }
        }
      }

      console.log('🔄 Creating offer...')
      const offer = await pc.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      })
      await pc.setLocalDescription(offer)
      console.log('📤 Local description set, sending to server...')
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
      console.log('📥 Received answer from server:', data)

      if (!data.sdp) {
        throw new Error('No SDP in server response')
      }

      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: data.sdp as string,
      }

      console.log('🔄 Setting remote description...')
      await pc.setRemoteDescription(answer)
      console.log('✅ Remote description set successfully')
    } catch (err) {
      console.error('❌ WebRTC init error:', err)
      setIsLoading(false)
      handleRetry()
    }
  }

  async function handleRetry() {
    if (isRetrying || retryCount >= maxRetries) return
    setIsRetrying(true)
    setRetryCount((c) => c + 1)

    const delay = Math.pow(2, retryCount + 1) * 1000
    console.warn(`Retrying in ${delay / 1000}s...`)

    setTimeout(() => {
      cleanup()
      initializeWebRTC()
      setIsRetrying(false)
    }, delay)
  }

  async function cleanup() {
    console.log('🧹 Cleaning up WebRTC connection...')
    peerRef.current?.close()
    peerRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setHasStream(false)
    setIsLoading(false)
    setStreamSet(false)
    setTrackStates([])
    setNeedsUserInteraction(false)
  }

  function togglePlayPause() {
    if (!videoRef.current?.srcObject) return
    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach((track) => (track.enabled = isPaused))
    setIsPaused(!isPaused)
  }

  return (
    <>
      <div className="bg-black flex items-center justify-center w-full h-full relative">
        {/* Debug info */}
        <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded z-10">
          <div>Connection: {connectionState}</div>
          <div>Stream: {hasStream ? '✅' : '❌'}</div>
          <div>Loading: {isLoading ? '⏳' : '✅'}</div>
          {retryCount > 0 && <div>Retries: {retryCount}</div>}
          {trackStates.length > 0 && (
            <div className="mt-2 border-t border-gray-600 pt-2">
              <div className="text-xs text-gray-300">Tracks:</div>
              {trackStates.map((track, i) => (
                <div key={i} className="text-xs">
                  {track.kind}: {track.muted ? '🔇' : '🔊'} {track.readyState}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
            <div className="text-white text-lg">
              🔄 Connecting to camera stream...
            </div>
          </div>
        )}

        {/* No stream message */}
        {!isLoading && !hasStream && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
            📹 No video stream available
          </div>
        )}

        {/* User interaction needed */}
        {needsUserInteraction && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20 cursor-pointer">
            <div className="text-center text-white">
              <div className="text-xl mb-2">🎬</div>
              <div className="text-lg">Click to Start Video</div>
              <div className="text-sm text-gray-300 mt-2">
                Browser autoplay policy requires user interaction
              </div>
            </div>
          </div>
        )}

        {/* Muted tracks warning */}
        {hasStream &&
          trackStates.some((t) => t.muted) &&
          !needsUserInteraction && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-15">
              <div className="text-center text-white">
                <div className="text-xl mb-2">🔇</div>
                <div className="text-lg">
                  Stream Connected - Waiting for Media
                </div>
                <div className="text-sm text-gray-300 mt-2">
                  Tracks are muted. This usually means the server is not sending
                  media data yet.
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Check MediaMTX server source and configuration
                </div>
              </div>
            </div>
          )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls={false}
          muted
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <button
          onClick={togglePlayPause}
          className="bg-white rounded-lg px-3 py-1"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </>
  )
}
