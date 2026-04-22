'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { FileRejection, useDropzone } from 'react-dropzone'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { DarkCloudUpload, FileArrowUp, Swap, Trash2 } from '@/components/icons'
import CloudArrowUp from '@/components/icons/cloud-arrow-up'
import {
  isGlbFile,
  MAX_BYTES,
  threeModelAccept,
  validatorFile,
} from '../../dialog-upload/utils'
import { useAddFloor, useUpdateFloor } from '../hooks/useBuildingManagement'
import { Floor } from '@/types/floor'

const floorSchema = z.object({
  name: z.string().min(1, { message: 'Floor name is required' }).trim(),
})

type FloorValues = z.infer<typeof floorSchema>

type DialogFloorProps = {
  trigger: ReactNode
  buildingId: string
  nextLevel: number
  onSuccess: () => void
  floor?: Floor
}

export function DialogFloor({
  onSuccess,
  buildingId,
  nextLevel,
  floor,
  trigger,
}: DialogFloorProps) {
  const isEdit = !!floor

  const t = useTranslations('smartBuilding')
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File>()

  const { trigger: addFloor, isMutating: isAdding } = useAddFloor(buildingId)
  const { trigger: updateFloor, isMutating: isUpdating } = useUpdateFloor(
    floor?.id ?? undefined
  )
  const isMutating = isAdding || isUpdating

  const form = useForm<FloorValues>({
    defaultValues: { name: isEdit ? floor.name : '' },
    resolver: zodResolver(floorSchema),
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: isEdit ? floor.name : '' })
      setSelectedFile(undefined)
    }
  }, [open])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
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
        setSelectedFile(file)
        return
      }

      if (!fileRejections.length) return
      const code = fileRejections[0].errors[0]?.code
      toast.error(
        code === 'file-too-large'
          ? t('three_model_too_large')
          : t('invalid_three_model')
      )
      if (!isEdit) setSelectedFile(undefined)
    },
    [t, isEdit]
  )

  const {
    getRootProps,
    getInputProps,
    open: openUpload,
  } = useDropzone({
    onDrop,
    accept: threeModelAccept,
    maxFiles: 1,
    maxSize: MAX_BYTES,
    noClick: true,
    noKeyboard: true,
    validator: validatorFile,
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors?.[0]?.code
      toast.error(
        code === 'file-too-large'
          ? t('three_model_too_large')
          : t('invalid_three_model')
      )
      if (!isEdit) setSelectedFile(undefined)
    },
  })

  const handleSubmit = async (values: FloorValues) => {
    try {
      if (!isEdit) {
        if (!selectedFile) {
          toast.error(t('upload_3d_model_required'))
          return
        }
        await addFloor({
          model: selectedFile,
          name: values.name,
          level: nextLevel,
        })
        toast.success(t('add_floor_success'))
      } else {
        await updateFloor({
          name: values.name,
          level: floor.level,
          model: selectedFile,
        })
        toast.success(t('edit_floor_success'))
      }
      handleClose()
      onSuccess()
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : t(isEdit ? 'edit_floor_error' : 'add_floor_error')
      )
    }
  }

  const handleClose = () => {
    setOpen(false)
    form.reset()
    setSelectedFile(undefined)
  }

  const handleOpenChange = (next: boolean) => {
    if (isMutating) return
    setOpen(next)
    if (!next) handleClose()
  }

  const existingModel = isEdit ? (floor.scene_asset ?? null) : null
  const displayedModel = selectedFile?.name ?? existingModel

  const canTrash = !!selectedFile

  const isSaveDisabled =
    !form.formState.isValid || isMutating || (!isEdit && !selectedFile)
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="p-4 max-w-md">
        <DialogHeader className="border-b-0 p-0">
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 shrink-0"
              >
                <ArrowLeft className="size-4" />
              </Button>
            </DialogClose>
            <DialogTitle className="text-base font-semibold text-brand-component-text-dark dark:text-white">
              {isEdit ? t('edit_floor') : t('add_new_floor')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <input {...getInputProps()} className="hidden" />

            <div className="space-y-3">
              <p className="text-xs font-semibold text-brand-component-text-dark dark:text-white">
                {t('upload_floor_3d_model')}
              </p>

              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="sr-only">{t('floor_name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('floor_name_placeholder')}
                        className="placeholder:text-brand-component-text-gray placeholder:font-medium"
                        isError={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {displayedModel ? (
                <div className="flex items-center justify-between rounded-lg bg-brand-component-fill-dark-soft p-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-brand-component-text-gray">
                    <FileArrowUp />
                    <span className="max-w-[180px] truncate">
                      {displayedModel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" type="button" onClick={openUpload}>
                      <Swap />
                    </Button>
                    {canTrash && (
                      <Button
                        size="icon"
                        type="button"
                        variant="destructive"
                        onClick={() => setSelectedFile(undefined)}
                      >
                        <Trash2 fill="#FFFFFF" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps({
                    className:
                      'flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-brand-component-fill-dark-soft p-6 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-brand-stroke-outermost',
                  })}
                >
                  <DarkCloudUpload />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={openUpload}
                  >
                    {t('upload_3d_model')}
                    <CloudArrowUp />
                  </Button>
                  <p className="text-xs text-brand-component-text-gray">
                    {t('glb_import_hint')}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-lg"
                >
                  {t('cancel')}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="h-12 rounded-lg"
                disabled={isSaveDisabled}
                loading={isMutating}
              >
                {t('save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
