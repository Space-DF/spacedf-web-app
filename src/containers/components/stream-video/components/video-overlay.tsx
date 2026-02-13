import { LoaderCircle, RotateCw } from 'lucide-react'

interface VideoOverlayProps {
  showRetryButton: boolean
  connectionState: RTCPeerConnectionState
  onRetry: () => void
}

export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  showRetryButton,
  connectionState,
  onRetry,
}) => {
  if (!showRetryButton && connectionState === 'connected') {
    return null
  }

  return (
    <div
      className="absolute inset-0 bg-black/90 backdrop-blur-sm z-10 pointer-events-none flex items-center justify-center"
      onClick={showRetryButton ? onRetry : undefined}
      style={{ pointerEvents: showRetryButton ? 'auto' : 'none' }}
    >
      <p className="size-full justify-center flex items-center">
        {showRetryButton ? (
          <RotateCw className="text-brand-bright-lavender size-10 cursor-pointer" />
        ) : (
          <LoaderCircle className="text-brand-bright-lavender size-10 animate-spin" />
        )}
      </p>
    </div>
  )
}
