'use client'

import { useState } from 'react'
import { Trash2, UploadCloud } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FileArrowUp, Swap } from '@/components/icons'

export function DialogFloor({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader className="pt-4 pb-2 border-none">
          <DialogTitle className="text-lg text-center font-bold text-brand-component-text-dark">
            3D Building Management
          </DialogTitle>
        </DialogHeader>

        <div className="px-4">
          <div className="rounded-lg bg-brand-component-fill-dark-soft p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-component-text-dark font-semibold text-[16px] m-0 p-0">
                  Floor 1
                </p>
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <FileArrowUp className="size-4 shrink-0 text-brand-component-text-gray" />
                  <span className="truncate text-sm font-medium text-brand-component-text-gray">
                    digitalfortress_building.glb
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="icon">
                  <Swap className="size-4 text-brand-icon-light-fixed" />
                </Button>
                <Button variant="destructive" size="icon">
                  <Trash2 className="size-4 text-brand-icon-light-fixed" />
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-2 rounded-xl text-brand-component-text-dark gap-x-2"
          >
            Add more floors
            <UploadCloud className="size-4" />
          </Button>

          <p className="mt-1 text-center text-xs text-brand-component-text-dark">
            Only supports .glb/.usdz files. Maximum file size: 100MB
          </p>
        </div>

        <DialogFooter className="grid grid-cols-2 gap-4 p-4">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl px-8"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-12 rounded-xl px-10"
            onClick={() => setOpen(false)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
