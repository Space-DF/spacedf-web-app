import { cn } from '@/lib/utils'
import { useGlobalStore } from '@/stores'
import { Logo } from './logo'

const LoadingFullScreen = ({ className }: { className?: string }) => {
  const loadingTitle = useGlobalStore((state) => state.loadingTitle)
  const loadingDescription = useGlobalStore((state) => state.loadingDescription)

  return (
    <div
      className={cn(
        'pointer-events-none flex size-full flex-col items-center justify-center',
        className
      )}
    >
      <div className="size-48">
        <Logo />
      </div>
      {loadingTitle && (
        <div className="mb-6 mt-4 max-w-lg text-4xl font-medium tracking-[-0.72px] text-brand-heading dark:text-white">
          {loadingTitle}
        </div>
      )}
      {loadingDescription && (
        <div className="max-w-lg text-center text-lg text-brand-text-gray">
          {loadingDescription}
        </div>
      )}
    </div>
  )
}

export default LoadingFullScreen
