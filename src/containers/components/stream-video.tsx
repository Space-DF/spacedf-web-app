import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import WebRTCVideo from './webrtc-video'
import { useRef, useState, useEffect } from 'react'
import { LoaderCircle } from 'lucide-react'

interface VideoPlaybarProps {
  isPlaying?: boolean
  onPlayPause?: () => void
  className?: string
  onFullScreen: () => void
  isFullscreen?: boolean
  onExitFullscreen?: () => void
}

const VideoPlaybar = ({
  isPlaying = false,
  className,
  onPlayPause,
  onFullScreen,
  isFullscreen = false,
  onExitFullscreen,
}: VideoPlaybarProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-1 bg-brand-component-progressbar-container backdrop-blur-sm rounded-full shadow-thin-border opacity-0 group-hover:opacity-100 transition-opacity duration-300',
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
      <button onClick={isFullscreen ? onExitFullscreen : onFullScreen}>
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

interface Props {
  autoPlay?: boolean
}

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  function togglePlayPause() {
    if (!videoRef.current?.srcObject) return
    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach((track) => (track.enabled = isPaused))
    setIsPaused(!isPaused)
  }

  const handleFullScreen = async () => {
    try {
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch {
      // Fallback to video element fullscreen
      if (videoRef.current) {
        await videoRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    }
  }

  const handleExitFullScreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        handleExitFullScreen()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  const statusColor = getConnectionStatusColor(connectionState)

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex-1 overflow-hidden rounded group',
        isFullscreen && 'fixed inset-0 z-50 bg-black rounded-none'
      )}
    >
      <div className="absolute top-4 left-4 z-20">
        <div className="flex space-x-2 items-center text-xs">
          <div className="relative">
            <div className={cn('size-2 rounded-full', statusColor)} />
            <div
              className={cn(
                'absolute inset-0 size-2 rounded-full animate-ping opacity-75',
                statusColor
              )}
            />
            <div
              className={cn(
                'absolute inset-0 size-2  rounded-full animate-pulse',
                statusColor
              )}
            />
          </div>
          <p className="text-white">{getConnectionStatus(connectionState)}</p>
        </div>
      </div>
      <div
        className={cn(
          'relative w-full h-full flex',
          connectionState !== 'connected' && 'bg-black/20',
          isFullscreen && 'h-screen'
        )}
      >
        <WebRTCVideo
          isFullscreen={isFullscreen}
          setConnectionState={setConnectionState}
          ref={videoRef}
        />
      </div>

      {connectionState !== 'connected' && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-10 pointer-events-none flex items-center justify-center">
          <p className="size-full justify-center flex items-center">
            <LoaderCircle className="text-brand-bright-lavender size-10 animate-spin " />
          </p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none z-10" />
      <div
        className={cn(
          'absolute bottom-0 left-0 w-full z-10',
          isFullscreen &&
            'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        )}
      >
        <div className="p-1.5">
          <VideoPlaybar
            onFullScreen={handleFullScreen}
            onExitFullscreen={handleExitFullScreen}
            isFullscreen={isFullscreen}
            isPlaying={!isPaused}
            onPlayPause={togglePlayPause}
          />
        </div>
      </div>
    </div>
  )
}
