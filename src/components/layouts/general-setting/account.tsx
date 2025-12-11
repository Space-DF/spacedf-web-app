import { Button } from '@/components/ui/button'
import { InputWithIcon } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  confirmPasswordSchema,
  currentPasswordSchema,
  newPasswordSchema,
} from '@/utils'
import { useProfile } from './hooks/useProfile'
import { useChangePassword } from './hooks/useChangePassword'
import { toast } from 'sonner'
import { useGeneralSetting } from './store/useGeneralSetting'

const createProfileSchema = (isSetPassword: boolean) => {
  const baseSchema = z.object({
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .min(1, { message: 'Email is required' })
      .max(50, {
        message: 'Email must be less than or equal to 50 characters',
      })
      .optional(),
    current_password: isSetPassword
      ? currentPasswordSchema
      : z.string().optional(),
    new_password: newPasswordSchema,
    confirm_password: confirmPasswordSchema,
  })

  return baseSchema.refine(
    (data) => data.new_password === data.confirm_password,
    {
      message: 'Confirm new password must match the new password entered above',
      path: ['confirm_password'],
    }
  )
}

const Account = () => {
  const t = useTranslations('generalSettings')
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isShowNewPassword, setIsShowNewPassword] = useState(false)
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false)
  const { data: profile } = useProfile()

  const isSetPassword = profile?.is_set_password ?? false
  const profileSchema = createProfileSchema(isSetPassword)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  })

  const closeDialog = useGeneralSetting((state) => state.closeDialog)
  const setCurrentSetting = useGeneralSetting(
    (state) => state.setCurrentSetting
  )

  const { trigger: changePassword, isMutating: isChangingPassword } =
    useChangePassword()

  useEffect(() => {
    if (!profile) return
    form.setValue('email', profile.email)
  }, [profile])

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    await changePassword(
      {
        password: values.current_password,
        new_password: values.new_password,
      },
      {
        onSuccess: () => {
          form.reset()
          toast.success(t('update_password_success'))
          closeDialog()
          setCurrentSetting('profile')
        },
        onError: (error) => {
          toast.error(error.message || t('update_password_error'))
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="animate-opacity-display-effect"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="flex-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<Mail size={16} />}
                    placeholder="Email"
                    disabled
                    {...field}
                    isError={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="!my-6" />
          {isSetPassword && (
            <FormField
              control={form.control}
              name="current_password"
              render={({ field, fieldState }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('current_password')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                      prefixCpn={<LockKeyhole size={16} />}
                      type={isShowPassword ? 'text' : 'password'}
                      suffixCpn={
                        <span
                          className="cursor-pointer"
                          onClick={() => setIsShowPassword(!isShowPassword)}
                        >
                          {isShowPassword ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </span>
                      }
                      placeholder={t('current_password')}
                      {...field}
                      isError={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="new_password"
            render={({ field, fieldState }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('new_password')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<LockKeyhole size={16} />}
                    type={isShowNewPassword ? 'text' : 'password'}
                    suffixCpn={
                      <span
                        className="cursor-pointer"
                        onClick={() => setIsShowNewPassword(!isShowNewPassword)}
                      >
                        {isShowNewPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </span>
                    }
                    placeholder={t('new_password')}
                    {...field}
                    isError={!!fieldState.error}
                  />
                </FormControl>
                <FormDescription className="text-xs font-medium text-brand-text-gray">
                  {t('minimum_8_characters')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field, fieldState }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('confirm_new_password')}</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<LockKeyhole size={16} />}
                    type={isShowConfirmPassword ? 'text' : 'password'}
                    suffixCpn={
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          setIsShowConfirmPassword(!isShowConfirmPassword)
                        }
                      >
                        {isShowConfirmPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </span>
                    }
                    placeholder={t('confirm_new_password')}
                    {...field}
                    isError={!!fieldState.error}
                  />
                </FormControl>
                <FormDescription className="text-xs font-medium text-brand-text-gray">
                  {t('minimum_8_characters')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-4 flex gap-2">
            <Button size="lg" className="w-full" loading={isChangingPassword}>
              {t('update_password')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default Account
