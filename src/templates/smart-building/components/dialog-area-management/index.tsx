'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
} from '../dialog-upload/utils'
import { useUpdateArea } from '../dialog-building-management/hooks/useBuildingManagement'
import { Area } from '@/types/area'

const areaSchema = z.object({
  name: z.string().min(1, { message: 'Area name is required' }).trim(),
})

type AreaFormValues = z.infer<typeof areaSchema>

export type DialogAreaManagementProps = {
  trigger?: ReactNode
  area: Area
  refetch: () => void
}

export function DialogAreaManagement({
  trigger,
  area,
  refetch,
}: DialogAreaManagementProps) {
  const t = useTranslations('smartBuilding')
  const [open, setOpen] = useState(false)
  const [newFile, setNewFile] = useState<File>()

  const { trigger: updateArea, isMutating } = useUpdateArea(area.id)

  const form = useForm<AreaFormValues>({
    defaultValues: { name: area.name },
    resolver: zodResolver(areaSchema),
  })

  useEffect(() => {
    if (open) {
      form.reset({ name: area.name })
      setNewFile(undefined)
    }
  }, [open, area.name])

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
        setNewFile(file)
        return
      }

      if (!fileRejections.length) return
      const code = fileRejections[0].errors[0]?.code
      toast.error(
        code === 'file-too-large'
          ? t('three_model_too_large')
          : t('invalid_three_model')
      )
    },
    [t]
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
    },
  })

  const handleSave = async (values: AreaFormValues) => {
    try {
      await updateArea({ name: values.name, model: newFile })
      toast.success(t('area_management_save_success'))
      refetch()
      setOpen(false)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : t('area_management_save_error')
      )
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (isMutating) return
    setOpen(next)
  }

  const displayedModel = newFile?.name ?? area.scene_asset ?? null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="p-4 max-w-md">
        <DialogHeader className="border-b-0 p-0 pb-4">
          <DialogTitle className="text-base font-semibold text-brand-component-text-dark dark:text-white">
            {t('building_management_title', { name: area.name })}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <input {...getInputProps()} className="hidden" />

            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-xs font-semibold text-brand-component-text-dark dark:text-white"
                  >
                    {t('area_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('area_name_placeholder')}
                      className="placeholder:text-brand-component-text-gray placeholder:font-medium"
                      isError={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <p className="text-xs font-semibold text-brand-component-text-dark dark:text-white">
                {t('upload_area_3d_model')}
              </p>

              {displayedModel ? (
                <div className="flex items-center justify-between rounded-lg border border-brand-stroke-dark-soft bg-brand-component-fill-dark-soft p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileArrowUp className="size-5 shrink-0 text-brand-icon-gray" />
                    <span className="truncate text-sm font-medium text-brand-component-text-gray">
                      {displayedModel}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 ml-2">
                    <Button
                      size="icon"
                      type="button"
                      className="size-8"
                      onClick={openUpload}
                    >
                      <Swap />
                    </Button>
                    {newFile && (
                      <Button
                        size="icon"
                        type="button"
                        variant="destructive"
                        className="size-8"
                        onClick={() => setNewFile(undefined)}
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
                loading={isMutating}
                disabled={!form.formState.isValid || isMutating}
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
