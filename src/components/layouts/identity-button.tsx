"use client"

import { useIdentityStore } from "@/stores/identity-store"
import { LogIn } from "lucide-react"
import { useShallow } from "zustand/react/shallow"

const IdentityButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const setOpenDrawerIdentity = useIdentityStore(
    useShallow((state) => state.setOpenDrawerIdentity)
  )
  return (
    <div
      className="h-10 w-full p-[2px] bg-transparent border border-brand-bright-lavender rounded-xl min-w-10 text-white cursor-pointer group"
      onClick={() => setOpenDrawerIdentity(true)}
    >
      <div className="flex items-center justify-center border-brand-bright-lavender rounded-lg bg-gradient-to-r from-brand-very-light-blue to-brand-bright-lavender h-full group-hover:opacity-80 duration-300">
        {isCollapsed ? (
          <LogIn size={18} />
        ) : (
          <p className="text-xs truncate max-w-[90%] font-medium">
            Register your own organization
          </p>
        )}
      </div>
    </div>
  )
}

export default IdentityButton
