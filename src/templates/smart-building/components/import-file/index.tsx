'use client'

import { Button } from '@/components/ui/button'
import ImageWithBlur from '@/components/ui/image-blur'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import NodataSVG from '/public/images/nodata.svg'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { toast } from 'sonner'
import CloudArrowUp from '@/components/icons/cloud-arrow-up'
import { useModelGLB } from '@/stores/template/model-glb'
import { UploadModelResult } from './hooks/useUploadGlb'
import { TriggerWithArgs } from 'swr/mutation'
import { useShowDummyData } from '@/hooks/useShowDummyData'

const MAX_BYTES = 100 * 1024 * 1024

const threeModelAccept = {
  'model/gltf-binary': ['.glb'],
  'application/octet-stream': ['.glb'],
  '.usdz': ['.usdz'],
  'model/vnd.usdz+zip': ['.usdz'],
} as const

function isGlbFile(file: File) {
  return (
    file.name.toLowerCase().endsWith('.glb') ||
    file.type === 'model/gltf-binary' ||
    file.type === 'application/octet-stream' ||
    file.name.toLowerCase().endsWith('.usdz') ||
    file.type === 'model/vnd.usdz+zip'
  )
}

export type ImportThreeModelProps = {
  className?: string
  onImport: (objectUrl: string) => void
  isHidden?: boolean
  isUploading?: boolean
  progress: number | null
  uploadModel: TriggerWithArgs<UploadModelResult, Error, string, File>
}

export function ImportThreeModel({
  className,
  onImport,
  isHidden,
  isUploading,
  progress,
  uploadModel,
}: ImportThreeModelProps) {
  const t = useTranslations('smartBuilding')
  const setModelGlb = useModelGLB((state) => state.setModelGLB)
  const registerUploadPickerOpener = useModelGLB(
    (state) => state.registerUploadPickerOpener
  )

  const showDummyData = useShowDummyData()

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const file = acceptedFiles[0]
      if (file) {
        if (!isGlbFile(file)) {
          toast.error(t('invalid_three_model'))
          return
        }
        if (file.size > MAX_BYTES) {
          toast.error(t('three_model_too_large'))
          return
        }
        const url = URL.createObjectURL(file)
        if (showDummyData) {
          onImport(url)
          setModelGlb(file.name)
          return
        }
        await uploadModel(file, {
          onSuccess: () => {
            onImport(url)
            setModelGlb(file.name)
          },
          onError: () => {
            toast.error(t('upload_failed'))
          },
        })
        return
      }

      if (!fileRejections.length) return

      const code = fileRejections[0].errors[0]?.code
      if (code === 'file-too-large') {
        toast.error(t('three_model_too_large'))
      } else {
        toast.error(t('invalid_three_model'))
      }
    },
    [onImport, setModelGlb, t, uploadModel]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: threeModelAccept,
    maxFiles: 1,
    maxSize: MAX_BYTES,
    noClick: true,
    noKeyboard: true,
    disabled: isUploading,
    validator: (f) =>
      f.name.toLowerCase().endsWith('.glb') ||
      f.name.toLowerCase().endsWith('.usdz') ||
      f.type === 'model/gltf-binary' ||
      f.type === 'application/octet-stream' ||
      f.type === 'model/vnd.usdz+zip'
        ? null
        : { code: 'file-invalid-type', message: '' },
  })

  useEffect(() => {
    registerUploadPickerOpener(open)
    return () => registerUploadPickerOpener(undefined)
  }, [open, registerUploadPickerOpener])

  return (
    <div
      {...getRootProps({
        className: cn(
          'flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/20 bg-gradient-to-b from-black/45 to-black/25 p-4 text-center text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.65)] ring-1 ring-inset ring-white/5 backdrop-blur-md transition-[border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-white/30',
          isDragActive &&
            !isUploading &&
            'border-white/45 bg-white/5 ring-white/20',
          className,
          isHidden && 'hidden'
        ),
      })}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex w-full flex-col items-center gap-4 py-2">
          <div className="size-20 shrink-0">
            <ImageWithBlur src={NodataSVG} alt="" className="h-full w-full" />
          </div>
          <p className="text-sm font-medium text-white">{t('uploading_glb')}</p>
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <Progress
              value={progress ?? 0}
              className="h-2.5 bg-white/20"
              indicatorStyle={{ backgroundColor: '#D9D9D9' }}
            />
            <span className="text-sm tabular-nums text-white">
              {Math.round(progress ?? 0)}%
            </span>
          </div>
          <p className="text-xs text-brand-component-text-gray">
            {t('glb_import_hint')}
          </p>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="pointer-events-auto rounded-lg p-1 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/30"
            onClick={() => open()}
            aria-label={t('import_glb')}
          >
            <div className="size-20">
              <ImageWithBlur src={NodataSVG} alt="" className="h-full w-full" />
            </div>
          </button>
          <div className="flex w-full flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-y-4">
              <Button
                type="button"
                size="sm"
                variant="light"
                className="gap-2 p-3"
                onClick={() => open()}
              >
                <CloudArrowUp />
                Upload 3D Building File
              </Button>
              <span className="text-brand-component-text-light">
                {t('glb_import_hint')}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
