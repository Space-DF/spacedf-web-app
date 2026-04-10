'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileBox, RotateCcw, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'

const GLB_ACCEPT = '.glb,model/gltf-binary,application/octet-stream'
const MAX_BYTES = 100 * 1024 * 1024

export type ImportGlbProps = {
  className?: string
  onImport: (objectUrl: string) => void
  onReset?: () => void
  showReset?: boolean
}

export function ImportGlb({
  className,
  onImport,
  onReset,
  showReset,
}: ImportGlbProps) {
  const t = useTranslations('smartBuilding')
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''

    if (!file) return

    const isGlb =
      file.name.toLowerCase().endsWith('.glb') ||
      file.type === 'model/gltf-binary' ||
      file.type === 'application/octet-stream'

    if (!isGlb) {
      toast.error(t('invalid_glb'))
      return
    }

    if (file.size > MAX_BYTES) {
      toast.error(t('glb_too_large'))
      return
    }

    const url = URL.createObjectURL(file)
    setFileName(file.name)
    onImport(url)
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-white/10 bg-gradient-to-b from-black/45 to-black/25 p-4 text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.65)] ring-1 ring-inset ring-white/5 backdrop-blur-md',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={GLB_ACCEPT}
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-2 bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/15 hover:ring-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4 shrink-0" aria-hidden />
            {t('import_glb')}
          </Button>
          {showReset && onReset ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-2 border-white/15 bg-white/0 text-white/90 ring-1 ring-inset ring-white/10 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
              onClick={() => {
                setFileName(null)
                onReset()
              }}
            >
              <RotateCcw className="size-4 shrink-0" aria-hidden />
              {t('reset_model')}
            </Button>
          ) : null}
        </div>

        {fileName ? (
          <div className="flex max-w-[320px] items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/80 ring-1 ring-inset ring-white/10">
            <FileBox className="size-3.5 shrink-0 text-white/70" aria-hidden />
            <span className="truncate" title={fileName}>
              {fileName}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
