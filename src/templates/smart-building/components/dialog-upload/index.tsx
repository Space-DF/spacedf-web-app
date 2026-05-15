'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
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
import { dialogUploadSchema } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { DarkCloudUpload, FileArrowUp, Swap } from '@/components/icons'
import CloudArrowUp from '@/components/icons/cloud-arrow-up'
import { FileRejection, useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  DEFAULT_VALUES,
  isGlbFile,
  MAX_BYTES,
  threeModelAccept,
  validatorFile,
} from './utils'
import { useUploadModel } from './hooks/useUploadModel'
import type { Building } from '@/types/building'

export type DialogUploadProps = {
  trigger?: ReactNode
  refetch: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  buildingToEdit?: Building | null
  onSaved?: (building: Building) => void
}

export type DialogUploadValues = z.infer<typeof dialogUploadSchema>

export function DialogUpload({
  trigger,
  refetch,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  buildingToEdit = null,
  onSaved,
}: DialogUploadProps) {
  const t = useTranslations('smartBuilding')
  const open = openProp
  const isEditMode = !!buildingToEdit

  const setOpen = (next: boolean) => {
    onOpenChangeProp?.(next)
  }

  const [selectedFile, setSelectedFile] = useState<File>()

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
      if (code === 'file-too-large') {
        toast.error(t('three_model_too_large'))
      } else {
        toast.error(t('invalid_three_model'))
      }
      setSelectedFile(undefined)
    },
    [t]
  )

  const form = useForm<DialogUploadValues>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(dialogUploadSchema),
  })

  const { trigger: uploadModel, isMutating: isUploadingModel } =
    useUploadModel()

  const existingModel = isEditMode ? buildingToEdit?.scene_asset : undefined
  const displayedModel = selectedFile?.name ?? existingModel

  useEffect(() => {
    if (!open) return
    if (buildingToEdit) {
      form.reset({ name: buildingToEdit.name })
    } else {
      form.reset(DEFAULT_VALUES)
    }
    setSelectedFile(undefined)
  }, [open, buildingToEdit?.id, form])

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
      const first = rejections[0]
      const message =
        first?.errors?.[0]?.code === 'file-too-large'
          ? `File is too large. Max ${Math.round(MAX_BYTES / (1024 * 1024))}MB.`
          : 'Invalid file. Please upload a .glb or .usdz file.'
      setSelectedFile(undefined)
      toast.error(message)
    },
  })

  async function handleSubmit(values: DialogUploadValues) {
    if (!isEditMode && !selectedFile) {
      toast.error(t('upload_3d_model_required'))
      return
    }
    if (isEditMode && buildingToEdit) {
      uploadModel(
        {
          mode: 'edit',
          buildingId: buildingToEdit.id,
          name: values.name,
          model: selectedFile,
        },
        {
          onSuccess: (saved) => {
            toast.success(t('edit_building_success'))
            setOpen(false)
            resetDialogState()
            onSaved?.(saved)
            refetch()
          },
          onError: (error) => {
            toast.error(error.message)
          },
        }
      )
      return
    }

    uploadModel(
      {
        mode: 'create',
        model: selectedFile!,
        name: values.name,
      },
      {
        onSuccess: (saved) => {
          toast.success(t('upload_3d_model_success'))
          setOpen(false)
          resetDialogState()
          onSaved?.(saved)
          refetch()
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  const resetDialogState = () => {
    form.reset()
    setSelectedFile(undefined)
  }

  const handleOpenChange = (next: boolean) => {
    if (isUploadingModel) return
    setOpen(next)
    if (!next) resetDialogState()
  }

  const isFormDisabled =
    !form.formState.isValid ||
    isUploadingModel ||
    (!isEditMode && !selectedFile)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="p-4">
        <DialogHeader className="border-b-0 p-0 pb-4">
          <DialogTitle className="text-[16px] font-semibold leading-6 text-brand-component-text-dark dark:text-white">
            {isEditMode
              ? t('edit_upload_3d_building_area_dialog_title')
              : t('upload_3d_building_area_dialog_title')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                    {t('upload_3d_building_area_dialog_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t(
                        'upload_3d_building_area_dialog_name_placeholder'
                      )}
                      className="placeholder:text-brand-component-text-gray placeholder:font-medium"
                      isError={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {displayedModel ? (
              <div className="p-2 rounded-lg flex items-center justify-between bg-brand-component-fill-dark-soft">
                <div className="flex items-center space-x-1 text-brand-component-text-gray font-medium text-sm">
                  <FileArrowUp />
                  {displayedModel}
                </div>
                <div className="flex items-center space-x-1">
                  <Button size="icon" type="button" onClick={openUpload}>
                    <Swap />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps({
                  className:
                    'flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-brand-component-fill-dark-soft p-6 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-brand-stroke-outermost disabled:cursor-not-allowed disabled:opacity-50',
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
                <div className="text-xs text-brand-component-text-gray">
                  {isEditMode
                    ? t('upload_3d_model_optional_replace_hint')
                    : t('glb_import_hint')}
                </div>
              </div>
            )}
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
                disabled={isFormDisabled}
                className="h-12 rounded-lg"
                loading={isUploadingModel}
              >
                {isEditMode ? t('save') : t('create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
