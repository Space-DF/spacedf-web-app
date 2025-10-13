import { Building, UserList } from '@/components/icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import ImageWithBlur from '@/components/ui/image-blur'
import { InputWithIcon } from '@/components/ui/input'
import { CloudUpload, MapPin, UserRound } from 'lucide-react'
import React, {
  ChangeEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react'
import AvtUser from '/public/images/avt-user.svg'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { firstNameSchema, lastNameSchema } from '@/utils'
import { useUpdateProfile } from './hooks/useUpdateProfile'
import { useProfile } from './hooks/useProfile'
import { DialogClose } from '@/components/ui/dialog'

const profileSchema = z.object({
  first_name: firstNameSchema,
  last_name: lastNameSchema,
  location: z.string().optional(),
  avatar: z.any().optional(),
  company_name: z
    .string()
    .max(100, {
      message: 'Company name must not exceed 100 characters',
    })
    .optional(),
  title: z
    .string()
    .max(100, {
      message: 'Title must not exceed 100 characters',
    })
    .optional(),
})

const Profile = () => {
  const t = useTranslations('generalSettings')

  const [previewImage, setPreviewImage] = useState<string>()
  const fileRef = useRef<HTMLInputElement>(null)
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  })

  const { trigger: updateProfile, isMutating: isUpdatingProfile } =
    useUpdateProfile()
  const {
    setValue,
    reset,
    formState: { isDirty },
  } = form

  const { data: profile, isLoading, mutate } = useProfile()
  async function onSubmit(values: z.infer<typeof profileSchema>) {
    await updateProfile({ ...values, avatar: values.avatar as File })
    toast.success(t('update_user_profile'))
    mutate()
  }

  useEffect(() => {
    if (!profile) return
    reset({ ...profile, avatar: undefined })
    setPreviewImage(profile.avatar)
  }, [profile])

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0]
    if (!image) return
    const imageUrl = URL.createObjectURL(image)
    setPreviewImage(imageUrl)
    setValue('avatar', image, {
      shouldDirty: true,
    })
  }

  const handleSelectImage = () => {
    fileRef.current?.click()
  }

  const previewImageSize = previewImage ? 96 : 40

  return (
    <Form {...form}>
      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="animate-opacity-display-effect"
      >
        <p className="mb-3 font-semibold">{t('avatar')}</p>
        <div className="mb-4 flex gap-3">
          <Avatar className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-600">
            <Suspense fallback={<AvatarFallback>{t('avatar')}</AvatarFallback>}>
              <div className="relative">
                <ImageWithBlur
                  src={previewImage || AvtUser}
                  width={previewImageSize}
                  height={previewImageSize}
                  alt="space-df"
                  className="size-full rounded-full object-cover"
                />
              </div>
            </Suspense>
          </Avatar>
          <div className="flex flex-col items-stretch justify-between py-3">
            <Button
              variant="outline"
              className="w-max items-center gap-2 rounded-lg dark:text-white"
              size="lg"
              type="button"
              disabled={isLoading}
              onClick={handleSelectImage}
            >
              {t('upload_new_image')} <CloudUpload size={16} />
            </Button>
            <p className="text-xs font-normal text-brand-text-gray">
              {t('800x800_png_jpg_is_recommended_maximum_file_size_2mb')}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field, fieldState }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('first_name')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                      prefixCpn={<UserRound size={16} />}
                      placeholder={t('first_name')}
                      disabled={isLoading}
                      {...field}
                      isError={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field, fieldState }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('last_name')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                      prefixCpn={<UserRound size={16} />}
                      placeholder={t('last_name')}
                      disabled={isLoading}
                      {...field}
                      isError={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="location"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('location')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<MapPin size={16} />}
                    placeholder={t('location')}
                    disabled={isLoading}
                    {...field}
                    isError={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('company_name')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<Building />}
                    placeholder={t('company_name')}
                    {...field}
                    disabled={isLoading}
                    isError={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('title')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<UserList />}
                    placeholder={t('title')}
                    disabled={isLoading}
                    {...field}
                    isError={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 rounded-lg border-brand-stroke-dark-soft text-brand-text-gray shadow-none"
            >
              {t('cancel')}
            </Button>
          </DialogClose>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full items-center gap-2 rounded-lg border-4 border-brand-heading bg-brand-fill-outermost font-medium text-white shadow-sm dark:border-brand-stroke-outermost"
            loading={isUpdatingProfile}
            disabled={!isDirty}
          >
            {t('save_changes')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default Profile
