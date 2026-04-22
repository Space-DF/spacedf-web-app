'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { dialogUploadSchemaWithFloor, TAG_OPTIONS } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
import { DarkCloudUpload, FileArrowUp, Swap, Trash2 } from '@/components/icons'
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
import TagValue from './components/tag-value'
import { useUploadModel } from './hooks/useUploadModel'

export type DialogUploadProps = {
  trigger?: ReactNode
  refetch: () => void
}

export type DialogUploadValues = z.infer<typeof dialogUploadSchemaWithFloor>

export function DialogUpload({ trigger, refetch }: DialogUploadProps) {
  const t = useTranslations('smartBuilding')
  const [open, setOpen] = useState(false)
  const dialogContentRef = useRef<HTMLDivElement | null>(null)

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
    resolver: zodResolver(dialogUploadSchemaWithFloor),
  })

  const tag = form.watch('tag')
  const isSelectTag = !!tag

  const isBuilding = tag === 'building'

  const { trigger: uploadModel, isMutating: isUploadingModel } =
    useUploadModel(isBuilding)

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
    if (!selectedFile) {
      toast.error(t('upload_3d_model_required'))
      return
    }
    uploadModel(
      {
        model: selectedFile,
        name: values.name,
        floorName: values.floorName,
      },
      {
        onSuccess: () => {
          toast.success(t('upload_3d_model_success'))
          handleCancel()
          refetch()
        },
        onError: (error) => {
          console.log({ error })
          toast.error(error.message)
        },
      }
    )
  }

  const handleCancel = () => {
    setOpen(false)
    form.reset()
    setSelectedFile(undefined)
  }

  const handleOpenChange = (next: boolean) => {
    if (isUploadingModel) return
    setOpen(next)
    if (!next) handleCancel()
  }

  const isFormDisabled =
    !form.formState.isValid || isUploadingModel || !selectedFile

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent ref={dialogContentRef} className="p-4">
        <DialogHeader className="border-b-0 p-0 pb-4">
          <DialogTitle className="text-[16px] font-semibold leading-6 text-brand-component-text-dark dark:text-white">
            {t('upload_3d_building_area_dialog_title')}
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

            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-brand-component-text-dark dark:text-white">
                    {t('upload_3d_building_area_dialog_tag')}
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        icon={
                          <ChevronDown className="w-3 text-brand-icon-gray" />
                        }
                        className="text-brand-component-text-gray font-medium bg-brand-component-fill-dark-soft"
                      >
                        {!field.value ? (
                          <SelectValue
                            placeholder={t(
                              'upload_3d_building_area_dialog_tag_placeholder'
                            )}
                          />
                        ) : (
                          <TagValue value={field.value} />
                        )}
                      </SelectTrigger>
                      <SelectContent container={dialogContentRef.current}>
                        {TAG_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            {isSelectTag && (
              <>
                {isBuilding && (
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="floorName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-brand-component-text-dark dark:text-white">
                            {t('upload_floor_3d_model')}
                          </FormLabel>
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
                  </div>
                )}

                {selectedFile ? (
                  <div className="p-2 rounded-lg flex items-center justify-between bg-brand-component-fill-dark-soft">
                    <div className="flex items-center space-x-1 text-brand-component-text-gray font-medium text-sm">
                      <FileArrowUp />
                      {selectedFile.name}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button size="icon" type="button" onClick={openUpload}>
                        <Swap />
                      </Button>
                      <Button
                        size="icon"
                        type="button"
                        variant="destructive"
                        onClick={() => setSelectedFile(undefined)}
                      >
                        <Trash2 fill="#FFFFFF" />
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
                      {t('glb_import_hint')}
                    </div>
                  </div>
                )}
              </>
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
                {t('create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
