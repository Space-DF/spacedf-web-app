import { AppWireFrame } from '@/components/ui/app-wire-frame'
import { AppWireFrameDark } from '@/components/ui/app-wire-frame-dark'
import { usePageTransition } from '@/hooks'
import { cn } from '@/lib/utils'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'

const PreviewDomain = () => {
  const { organizationName } = useIdentityStore(
    useShallow((state) => ({
      organizationName: state.organizationName,
      openDrawerIdentity: state.openDrawerIdentity,
    })),
  )

  const { startRender } = usePageTransition({ duration: 200 })

  return (
    <div
      className={cn(
        'flex h-full max-h-full items-end justify-end overflow-hidden rounded-2xl duration-300',
        startRender
          ? 'translate-x-0 bg-brand-bright-lavender/50'
          : 'translate-x-full bg-transparent',
      )}
    >
      <div className="h-full w-full overflow-hidden pl-14 pt-14">
        <AppWireFrameDark
          className={cn(
            'hidden h-full w-full transition-all duration-700 dark:block',
            startRender
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0',
          )}
          organization={organizationName}
        />

        <AppWireFrame
          className={cn(
            'block h-full w-full transition-all duration-700 dark:hidden',
            startRender
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0',
          )}
          organization={organizationName}
        />
      </div>
    </div>
  )
}

export default PreviewDomain
