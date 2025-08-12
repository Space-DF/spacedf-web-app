import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface VideoPlaybarProps {
  currentTime?: number
  duration?: number
  isPlaying?: boolean
  onPlayPause?: () => void
  onSeek?: (time: number) => void
  className?: string
}

const VideoPlaybar = ({
  currentTime = 0,
  duration = 100,
  isPlaying = false,
  onPlayPause,
  onSeek,
  className,
}: VideoPlaybarProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [localCurrentTime, setLocalCurrentTime] = useState(currentTime)

  useEffect(() => {
    if (!isDragging) {
      setLocalCurrentTime(currentTime)
    }
  }, [currentTime, isDragging])

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-1 bg-brand-component-progressbar-container backdrop-blur-sm rounded-full shadow-thin-border',
        className
      )}
    >
      {/* Play/Pause Button */}
      <button onClick={onPlayPause}>
        {isPlaying ? (
          <Image
            src={'/images/pause-circle.svg'}
            alt="pause"
            width={20}
            height={20}
          />
        ) : (
          <Image
            src={'/images/play-circle.svg'}
            alt="play"
            width={20}
            height={20}
          />
        )}
      </button>
      <div className="flex-1 relative">
        <Slider
          value={[localCurrentTime]}
          onValueChange={(value) => {
            setLocalCurrentTime(value[0])
            setIsDragging(true)
          }}
          onValueCommit={(value) => {
            onSeek?.(value[0])
            setIsDragging(false)
          }}
          max={duration}
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

interface Props {
  webRTC?: string
}

export const StreamVideo = ({ webRTC }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(15) // Example current time: 15 seconds
  const [duration] = useState(180) // Example duration: 3 minutes
  const [streamError, setStreamError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev)
    if (webRTC && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {
          setStreamError(true)
        })
      }
    }
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
    if (webRTC && videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  // Setup WebRTC stream
  useEffect(() => {
    if (webRTC && videoRef.current) {
      const video = videoRef.current

      // Set the stream source
      video.src = webRTC
      video.load()

      const handleLoadedMetadata = () => {
        setStreamError(false)
      }

      const handleError = () => {
        setStreamError(true)
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('error', handleError)

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('error', handleError)
      }
    }
  }, [webRTC])

  // Simulate video progress when playing (for placeholder mode)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentTime < duration && (!webRTC || streamError)) {
      interval = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 1, duration))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentTime, duration, webRTC, streamError])

  // Update currentTime from video element for WebRTC stream
  useEffect(() => {
    if (webRTC && videoRef.current && !streamError) {
      const video = videoRef.current

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime)
      }

      video.addEventListener('timeupdate', handleTimeUpdate)

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [webRTC, streamError])

  const shouldShowPlaceholder = !webRTC || streamError

  return (
    <div className="relative flex-1 overflow-hidden rounded">
      <div className="absolute top-4 left-4">
        <div className="flex space-x-2 items-center text-xs">
          <div className="relative">
            <div className="size-2 bg-brand-component-fill-positive rounded-full" />
            <div className="absolute inset-0 size-2 bg-brand-component-fill-positive rounded-full animate-ping opacity-75" />
            <div className="absolute inset-0 size-2 bg-brand-component-fill-positive rounded-full animate-pulse" />
          </div>
          <p className="text-white">Live</p>
        </div>
      </div>
      {shouldShowPlaceholder ? (
        <Image
          src="/images/camera-video.png"
          alt="camera"
          width={100}
          height={100}
          className="size-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          className="size-full object-cover"
          controls={false}
          autoPlay={false}
          muted
        />
      )}
      {/* Dark to light gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full">
        <div className="p-1.5">
          <VideoPlaybar
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
          />
        </div>
      </div>
    </div>
  )
}
