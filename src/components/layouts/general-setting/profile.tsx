import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import ImageWithBlur from '@/components/ui/image-blur'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { locales } from '@/i18n/request'
import { usePathname, useRouter as useLocaleRouter } from '@/i18n/routing'
import { Locale } from '@/types/global'
import { firstNameSchema, lastNameSchema } from '@/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { CloudUpload } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import AvtUser from '/public/images/avt-user.svg'
import { useProfile } from './hooks/useProfile'
import { useUpdateProfile } from './hooks/useUpdateProfile'

const profileSchema = z.object({
  first_name: firstNameSchema,
  last_name: lastNameSchema,
  avatar: z.any().optional(),
  // PUT /api/me writes every field it receives, so these are kept in the form and
  // re-sent from the server values. Dropping them would clear them on save. They
  // render no FormMessage, so they must accept whatever the API returns.
  location: z.string().nullish(),
  company_name: z.string().nullish(),
  title: z.string().nullish(),
})

const Profile = () => {
  const t = useTranslations('generalSettings')
  const tLanguage = useTranslations('languageName')

  const locale = useLocale()
  const pathname = usePathname()
  const localeRouter = useLocaleRouter()

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
    await updateProfile(
      { ...values, avatar: values.avatar as File },
      {
        onSuccess: () => {
          toast.success(t('update_user_profile'))
          mutate()
        },
        onError: (error) => {
          toast.error(error.message || t('update_user_profile_error'))
        },
      }
    )
  }

  useEffect(() => {
    if (!profile) return
    reset({ ...profile, avatar: undefined })
    setPreviewImage(profile.url_avatar)
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
        className="animate-opacity-display-effect space-y-4"
      >
        <div className="space-y-[6px]">
          <Label>{t('avatar')}</Label>
          <div className="flex items-center gap-2">
            <Avatar className="size-9 bg-purple-200 dark:bg-purple-600">
              <ImageWithBlur
                src={previewImage || AvtUser}
                width={36}
                height={36}
                alt={t('avatar')}
                className="size-full object-cover"
              />
            </Avatar>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleSelectImage}
              className="h-6 gap-2 rounded-lg px-2 py-1 text-xs font-semibold"
            >
              <CloudUpload size={16} />
              {t('upload_image')}
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field, fieldState }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('first_name')}</FormLabel>
                <FormControl>
                  <Input
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
                  <Input
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

        <div className="space-y-[6px]">
          <Label htmlFor="profile-email">{t('email')}</Label>
          <Input
            id="profile-email"
            value={profile?.email ?? ''}
            readOnly
            disabled
          />
        </div>

        <div className="space-y-[6px]">
          <Label htmlFor="profile-language">{t('language')}</Label>
          <Select
            value={locale}
            onValueChange={(value) =>
              localeRouter.push(pathname, { locale: value as Locale })
            }
          >
            <SelectTrigger id="profile-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locales.map((item) => (
                <SelectItem key={item} value={item}>
                  {tLanguage(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full shadow-sm"
          loading={isUpdatingProfile}
          disabled={!isDirty}
        >
          {t('save_changes')}
        </Button>
      </form>
    </Form>
  )
}

export default Profile
