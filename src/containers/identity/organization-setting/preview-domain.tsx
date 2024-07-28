import { AppWireFrame } from "@/components/ui/app-wire-frame"
import { usePageTransition } from "@/hooks"
import { cn } from "@/lib/utils"
import { useIdentityStore } from "@/stores/identity-store"
import { useShallow } from "zustand/react/shallow"

const PreviewDomain = () => {
  const { organizationName } = useIdentityStore(
    useShallow((state) => ({
      organizationName: state.organizationName,
      openDrawerIdentity: state.openDrawerIdentity,
    }))
  )

  const { startRender } = usePageTransition({ duration: 200 })

  return (
    <div
      className={cn(
        "rounded-2xl duration-300 h-full max-h-full flex items-end justify-end overflow-hidden",
        startRender
          ? "bg-brand-bright-lavender/50 translate-x-0"
          : "bg-transparent translate-x-full"
      )}
    >
      <div className="pt-14 pl-14 w-full h-full overflow-hidden">
        <AppWireFrame
          className={cn(
            "w-full h-full duration-700 transition-all",
            startRender
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          )}
          organization={organizationName}
        />
      </div>
    </div>
  )
}

export default PreviewDomain
