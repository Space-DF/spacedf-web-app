import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  connectionState: RTCPeerConnectionState
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

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
}) => {
  const statusColor = getConnectionStatusColor(connectionState)
  const statusText = getConnectionStatus(connectionState)

  return (
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
              'absolute inset-0 size-2 rounded-full animate-pulse',
              statusColor
            )}
          />
        </div>
        <p className="text-white">{statusText}</p>
      </div>
    </div>
  )
}
