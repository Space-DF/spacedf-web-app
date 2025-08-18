import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { WebRTCVideo } from './webrtc-video'
import { useRef, useState } from 'react'

interface VideoPlaybarProps {
  isPlaying?: boolean
  onPlayPause?: () => void
  className?: string
}

const VideoPlaybar = ({
  isPlaying = false,
  className,
  onPlayPause,
}: VideoPlaybarProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-1 bg-brand-component-progressbar-container backdrop-blur-sm rounded-full shadow-thin-border',
        className
      )}
    >
      <button onClick={onPlayPause}>
        {isPlaying ? (
          <Image
            src={'/images/pause-circle.svg'}
            alt="pause"
            width={50}
            height={50}
            className="size-5"
          />
        ) : (
          <Image
            src={'/images/play-circle.svg'}
            alt="play"
            width={50}
            height={50}
            className="size-5"
          />
        )}
      </button>
      <div className="flex-1 relative">
        <Slider
          value={[100]}
          disabled
          max={100}
          step={1}
          className="w-full"
          classNameTrack="bg-brand-component-fill-dark h-1"
          classNameRange="bg-gradient-to-r from-[#6E4AFF] to-[#CCBFFF] h-1"
          classNameThumb="bg-white w-3 h-3 border-0 shadow-lg"
        />
      </div>
      <button>
        <Image
          src={'/images/maximize.svg'}
          alt="maximize"
          width={20}
          height={20}
        />
      </button>
    </div>
  )
}

interface Props {}

const getConnectionStatus = (state: RTCPeerConnectionState): string =>
  state === 'connected'
    ? 'Live'
    : ['new', 'connecting'].includes(state)
      ? 'Connecting...'
      : 'Disconnected'

const getConnectionStatusColor = (state: RTCPeerConnectionState): string =>
  state === 'connected'
    ? 'bg-brand-component-fill-positive'
    : ['new', 'connecting'].includes(state)
      ? 'bg-brand-component-fill-warning'
      : 'bg-brand-component-fill-negative'

export const StreamVideo: React.FC<Props> = () => {
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>('new')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  function togglePlayPause() {
    if (!videoRef.current?.srcObject) return
    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach((track) => (track.enabled = isPaused))
    setIsPaused(!isPaused)
  }

  return (
    <div className="relative flex-1 overflow-hidden rounded">
      <div className="absolute top-4 left-4 z-20">
        <div className="flex space-x-2 items-center text-xs">
          <div className="relative">
            <div
              className={cn(
                'size-2 rounded-full',
                getConnectionStatusColor(connectionState)
              )}
            />
            <div
              className={cn(
                'absolute inset-0 size-2 rounded-full animate-ping opacity-75',
                getConnectionStatusColor(connectionState)
              )}
            />
            <div
              className={cn(
                'absolute inset-0 size-2  rounded-full animate-pulse',
                getConnectionStatusColor(connectionState)
              )}
            />
          </div>
          <p className="text-white">{getConnectionStatus(connectionState)}</p>
        </div>
      </div>

      {/* Video container with conditional blur */}
      <div
        className={cn(
          'relative w-full h-full',
          connectionState !== 'connected' && 'blur-sm'
        )}
      >
        <WebRTCVideo setConnectionState={setConnectionState} ref={videoRef} />
      </div>

      {/* Blur overlay for non-connected states */}
      {connectionState !== 'connected' && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 pointer-events-none" />
      )}

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-full z-10">
        <div className="p-1.5">
          <VideoPlaybar isPlaying={!isPaused} onPlayPause={togglePlayPause} />
        </div>
      </div>
    </div>
  )
}
