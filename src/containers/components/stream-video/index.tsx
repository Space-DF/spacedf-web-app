import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRef } from 'react'
import { useWebRTCConnection } from '@/containers/components/stream-video/hooks/useWebRTCConnection'
import { useFullscreen } from '@/containers/components/stream-video/hooks/useFullscreen'
import { useVideoControls } from '@/containers/components/stream-video/hooks/useVideoControls'
import { VideoOverlay } from './components/video-overlay'
import { ConnectionStatus } from './components/connection-status'

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

export const StreamVideo: React.FC<Props> = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { isFullscreen, handleFullScreen, handleExitFullScreen } =
    useFullscreen({
      containerRef,
      videoRef,
    })

  const { isPaused, togglePlayPause } = useVideoControls({ videoRef })

  const { connectionState, showRetryButton, manualRetry } = useWebRTCConnection(
    {
      videoRef,
      isFullscreen,
    }
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex-1 overflow-hidden rounded group',
        isFullscreen && 'fixed inset-0 z-50 bg-black rounded-none'
      )}
    >
      <ConnectionStatus connectionState={connectionState} />

      <div
        className={cn(
          'relative w-full h-full flex',
          connectionState !== 'connected' && 'bg-black/20',
          isFullscreen && 'h-screen'
        )}
      >
        <video
          ref={videoRef}
          autoPlay={true}
          playsInline
          controls={false}
          muted
          preload="none"
          className="max-h-full max-w-full object-cover"
          onClick={manualRetry}
        />
      </div>

      <VideoOverlay
        showRetryButton={showRetryButton}
        connectionState={connectionState}
        onRetry={manualRetry}
      />

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
