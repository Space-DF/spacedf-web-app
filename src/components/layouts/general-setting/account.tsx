import { Button } from '@/components/ui/button'
import { InputWithIcon } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import React, { useState } from 'react'
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

const profileSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .min(1, { message: 'Email is required' })
      .max(50, {
        message: 'Email must be less than or equal to 50 characters',
      })
      .optional(),
    current_password: currentPasswordSchema,
    new_password: newPasswordSchema,
    confirm_password: confirmPasswordSchema,
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Confirm new password must match the new password entered above',
    path: ['confirm_password'],
  })

const Account = () => {
  const t = useTranslations('generalSettings')
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isShowNewPassword, setIsShowNewPassword] = useState(false)
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false)
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  })

  function onSubmit(values: z.infer<typeof profileSchema>) {
    // Upon click this button:
    //   If 2.3, 2.4, 2.4 correct → Update Successfully → Redirect to [A.I.6 HOME SCREEN (Organization)]
    // Other case → Error Message
    console.log(values)
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
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <InputWithIcon
                    className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
                    prefixCpn={<Mail size={16} />}
                    placeholder="Email"
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <div className="grid w-full flex-1 items-center gap-1.5">
              <Label
                htmlFor="email"
                className="gap-2 text-xs font-semibold text-brand-heading"
              >
                {t('authenticator_app')}
              </Label>
              <p className="text-xs font-normal text-brand-text-gray">
                {t(
                  'once_you_login_spacedf_we_will_send_you_a_notification_in_email',
                )}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="!my-6" />
          <FormField
            control={form.control}
            name="current_password"
            render={({ field }) => (
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
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
            render={({ field }) => (
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
            <Button size="lg" className="w-full">
              {t('update_password')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default Account
