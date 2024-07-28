import { DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import { CirclePlus } from "lucide-react"
import React from "react"

const AddNewSpace = () => {
  return (
    <>
      <div className="flex items-center gap-2">
        <CirclePlus size={20} />
        Add new Space
      </div>

      <DropdownMenuShortcut>⌘⌥N</DropdownMenuShortcut>
    </>
  )
}

export default AddNewSpace
