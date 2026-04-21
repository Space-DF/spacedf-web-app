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
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DarkCloudUpload, FileArrowUp, Swap, Trash2 } from '@/components/icons'
import CloudArrowUp from '@/components/icons/cloud-arrow-up'
import { FileRejection, useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { z } from 'zod'
import { isGlbFile, MAX_BYTES, threeModelAccept } from './utils'

export type DialogUploadProps = {
  trigger: ReactNode
}

export type DialogUploadValues = z.infer<typeof dialogUploadSchemaWithFloor>

const TagValue = ({ value }: { value: string }) => {
  const isBuilding = value === 'building'
  const className = isBuilding
    ? 'bg-brand-light-blue-100 text-brand-component-text-info hover:bg-brand-light-blue-100/80'
    : 'bg-brand-light-yellow-100 text-brand-component-text-warning hover:bg-brand-light-yellow-100/80'
  return (
    <Badge className={cn(className, 'rounded')}>
      {isBuilding ? 'Building' : 'Area'}
    </Badge>
  )
}

export function DialogUpload({ trigger }: DialogUploadProps) {
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
    validator: (f) =>
      f.name.toLowerCase().endsWith('.glb') ||
      f.name.toLowerCase().endsWith('.usdz') ||
      f.type === 'model/gltf-binary' ||
      f.type === 'application/octet-stream' ||
      f.type === 'model/vnd.usdz+zip'
        ? null
        : { code: 'file-invalid-type', message: '' },
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

  const form = useForm<DialogUploadValues>({
    defaultValues: {
      name: '',
      tag: undefined,
      floorName: '',
    },
    resolver: zodResolver(dialogUploadSchemaWithFloor),
  })

  async function handleSubmit(values: DialogUploadValues) {
    void values
    setOpen(false)
    form.reset()
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) form.reset()
  }

  const isBuilding = form.watch('tag') === 'building'

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
                  <Button
                    size="icon"
                    type="button"
                    onClick={() => {
                      console.log('swap')
                      openUpload()
                    }}
                  >
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
                disabled={
                  !form.formState.isValid ||
                  form.formState.isSubmitting ||
                  !selectedFile
                }
                className="h-12 rounded-lg"
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
