import { DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import { Settings } from "lucide-react"
import React from "react"

const OrganizationManagement = () => {
  return (
    <>
      <div className="flex items-center gap-2">
        <Settings size={20} />
        Add new Space
      </div>

      <DropdownMenuShortcut>⌘⌥M</DropdownMenuShortcut>
    </>
  )
}

export default OrganizationManagement
