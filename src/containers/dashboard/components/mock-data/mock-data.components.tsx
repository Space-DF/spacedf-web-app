import React, { useState, useEffect } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Equalizer } from '@/components/icons/equalizer'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const chartData = [
  {
    day: 'Mon',
    uv: 50,
  },
  {
    day: 'Tue',
    uv: 60,
  },
  {
    day: 'Wed',
    uv: 40,
  },
  {
    day: 'Thu',
    uv: 70,
  },
  {
    day: 'Fri',
    uv: 50,
  },
  {
    day: 'Sat',
    uv: 40,
  },
  {
    day: 'Sun',
    uv: 60,
  },
]

const polarData = [{ desktop: 215 }]

interface WidgetProp {
  children?: React.ReactNode
  className?: string
}

const WidgetContainer = ({ children, className }: WidgetProp) => (
  <div
    className={cn(
      'size-full rounded-md border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-2 dark:bg-brand-component-fill-gray-soft space-y-1',
      className
    )}
  >
    {children}
  </div>
)

const WidgetTitle = ({ children, className }: WidgetProp) => (
  <div
    className={cn(
      'line-clamp-1 text-sm font-medium text-brand-component-text-dark',
      className
    )}
  >
    {children}
  </div>
)

const WidgetChart = ({ children }: WidgetProp) => (
  <WidgetContainer>
    {children}
    <ResponsiveContainer className={'pb-3'}>
      <AreaChart accessibilityLayer data={chartData}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="15%" stopColor="currentColor" stopOpacity={0.8} />
            <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis
          axisLine={false}
          tickLine={false}
          width={20}
          tick={{ fontSize: 12 }}
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          tick={{ fontSize: 12 }}
        />
        <CartesianGrid vertical={false} opacity={0.3} />
        <Area
          type="linear"
          dataKey="uv"
          stroke="currentColor"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </WidgetContainer>
)

const PolarChart = ({ children, className }: WidgetProp) => (
  <WidgetContainer>
    {children}
    <ResponsiveContainer
      className={cn('mx-auto w-full object-contain', className)}
    >
      <RadialBarChart
        data={polarData}
        endAngle={240}
        startAngle={-60}
        innerRadius={55}
        outerRadius={35}
      >
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-brand-component-text-dark text-sm font-bold"
                    >
                      215.00
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 16}
                      className="fill-brand-component-text-gray text-sm font-medium"
                    >
                      ml
                    </tspan>
                    <tspan
                      x={(viewBox.cx || 0) - 26}
                      y={(viewBox.cy || 0) + 55}
                      className="fill-brand-component-text-dark text-[10px] font-medium"
                    >
                      100
                    </tspan>
                    <tspan
                      x={(viewBox.cx || 0) + 26}
                      y={(viewBox.cy || 0) + 55}
                      className="fill-brand-component-text-dark text-[10px] font-medium"
                    >
                      300
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </PolarRadiusAxis>
        <RadialBar
          dataKey="desktop"
          stackId="a"
          cornerRadius={10}
          fill="currentColor"
          className="size-full stroke-transparent"
        />
      </RadialBarChart>
    </ResponsiveContainer>
  </WidgetContainer>
)

const WidgetSlider = () => (
  <WidgetContainer>
    <div className="flex justify-between">
      <WidgetTitle>New Slider Widget</WidgetTitle>
      <WidgetTitle>ml</WidgetTitle>
    </div>
    <Slider
      className="my-1"
      classNameRange="bg-[#171A28] dark:bg-[#4006AA]"
      classNameThumb="bg-[#171A28] dark:bg-[#4006AA]"
      defaultValue={[50]}
      max={100}
      step={1}
    />
    <div className="flex justify-between text-[8px] font-medium dark:text-brand-component-text-dark">
      <span>0</span>
      <span>100</span>
    </div>
  </WidgetContainer>
)

const WidgetText = () => {
  return (
    <WidgetContainer>
      <WidgetTitle>Note:</WidgetTitle>
      <WidgetTitle className="line-clamp-1">Turn off</WidgetTitle>
    </WidgetContainer>
  )
}

const WidgetSwitch = ({ children, className }: WidgetProp) => {
  return (
    <WidgetContainer className="flex flex-col gap-1">
      {children}
      <Switch checked className={className} />
    </WidgetContainer>
  )
}

const WidgetSensor = ({
  children,
  className,
  status,
}: {
  className?: string
  children: React.ReactNode
  status: 'on' | 'off'
}) => (
  <WidgetContainer className="flex gap-3">
    <div className="relative flex size-7 items-center justify-center rounded-full">
      <div className="absolute inset-0 rounded-full bg-brand-icon-dark opacity-20 dark:bg-brand-dark-fill-secondary" />
      <Equalizer className={cn('relative z-10 opacity-100', className)} />
    </div>
    <div>
      {children}
      <p className="text-sm capitalize text-brand-component-text-gray">
        {status}
      </p>
    </div>
  </WidgetContainer>
)

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

interface WidgetCameraProps {
  webRTC?: string
}

const WidgetCamera = ({ webRTC }: WidgetCameraProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(15) // Example current time: 15 seconds
  const [duration] = useState(180) // Example duration: 3 minutes
  const [streamError, setStreamError] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

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
    <WidgetContainer className="flex flex-col">
      <WidgetTitle>Camera DMZ 01-1511-M01</WidgetTitle>
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
    </WidgetContainer>
  )
}

export {
  WidgetSensor,
  WidgetSwitch,
  WidgetContainer,
  WidgetText,
  WidgetSlider,
  WidgetChart,
  PolarChart,
  WidgetTitle,
  WidgetCamera,
  VideoPlaybar,
}
