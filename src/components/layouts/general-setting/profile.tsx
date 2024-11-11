import { Building, UserList } from '@/components/icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import ImageWithBlur from '@/components/ui/image-blur'
import { InputWithIcon } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CloudUpload, MapPin, UserRound } from 'lucide-react'
import React, { Suspense } from 'react'
import AvtUser from '/public/images/avt-user.svg'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const nameSchema = z
  .string()
  .min(1, { message: 'First name is required' })
  .max(50, {
    message: 'First name must be less than or equal to 50 characters',
  })
  .regex(/^[A-Za-z\s]*$/, {
    message: 'Only alphabetic characters and spaces are accepted',
  })

const profileSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  location: z.string().max(50),
  company_name: z.string().max(100, {
    message: 'Company name must be less than or equal to 100 characters',
  }),
  title: z.string().max(100, {
    message: 'Company name must be less than or equal to 100 characters',
  }),
})

const Profile = () => {
  const t = useTranslations('generalSettings')

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  })

  function onSubmit(values: z.infer<typeof profileSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="animate-opacity-display-effect"
      >
        <p className="mb-3 font-semibold">{t('avatar')}</p>
        <div className="mb-4 flex gap-3">
          <Avatar className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-600">
            <Suspense fallback={<AvatarFallback>{t('avatar')}</AvatarFallback>}>
              <ImageWithBlur
                src={AvtUser || ''}
                width={40}
                height={40}
                alt="space-df"
              />
            </Suspense>
          </Avatar>
          <div className="flex flex-col items-stretch justify-between py-3">
            <Button
              variant="outline"
              className="w-max items-center gap-2 rounded-lg dark:text-white"
              size="lg"
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
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('first_name')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                      prefixCpn={<UserRound size={16} />}
                      placeholder={t('first_name')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('last_name')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                      prefixCpn={<UserRound size={16} />}
                      placeholder={t('last_name')}
                      {...field}
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('location')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<MapPin size={16} />}
                    placeholder={t('location')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('company_name')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<Building />}
                    placeholder={t('company_name')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('title')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<UserList />}
                    placeholder={t('title')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" size="lg" variant="outline">
                {t('cancel')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center font-bold text-brand-text-dark">
                  {t('are_you_sure_you_want_to_exit')}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-12 flex-1 text-brand-text-gray">
                  {t('cancel')}
                </AlertDialogCancel>
                <AlertDialogAction className="h-12 flex-1 border-2 border-brand-semantic-accent-dark bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" size="lg" className="flex-1">
            {t('save_changes')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default Profile
