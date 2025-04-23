import { InputWithIcon } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { createNewPasswordSchema } from './validator/createNewPasswordSchema'
import { EyeOff, Eye, LockKeyhole } from 'lucide-react'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthForm } from './stores/useAuthForm'
import { useShallow } from 'zustand/react/shallow'
import { useResetPassword } from './hooks/useResetPassword'
import { useSearchParams } from 'next/navigation'

type CreateNewPasswordFormValues = z.infer<typeof createNewPasswordSchema>

export const CreateNewPasswordForm = () => {
  const t = useTranslations('signUp')
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false)

  const { setFormType } = useAuthForm(
    useShallow((state) => ({
      setFormType: state.setFormType,
    }))
  )

  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const { trigger: triggerResetPassword, isMutating: isMutatingResetPassword } =
    useResetPassword()

  const form = useForm<CreateNewPasswordFormValues>({
    resolver: zodResolver(createNewPasswordSchema),
  })

  const onSubmit = async (data: CreateNewPasswordFormValues) => {
    if (!token) return
    const { password } = data
    await triggerResetPassword({ token, password })
    setFormType('resetPasswordSuccessful')
  }

  return (
    <div className="mt-6">
      <div className="space-y-6 w-full animate-opacity-display-effect self-start">
        <div className="space-y-2 text-center">
          <p className="text-3xl font-semibold">{t('create_new_password')}</p>
          <p className="text-brand-component-text-gray text-[14px]">
            {t(
              'create_your_new_password_if_you_forget_it_then_you_have_to_do_forget_password'
            )}
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-[18px]"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-component-text-gray text-sm">
                    {t('new_password')}
                  </FormLabel>
                  <FormControl>
                    <InputWithIcon
                      type={isShowPassword ? 'text' : 'password'}
                      prefixCpn={<LockKeyhole size={16} />}
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
                      {...field}
                      placeholder={t('new_password')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-component-text-gray text-sm">
                    {t('confirm_new_password')}
                  </FormLabel>
                  <FormControl>
                    <InputWithIcon
                      type={isShowConfirmPassword ? 'text' : 'password'}
                      prefixCpn={<LockKeyhole size={16} />}
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
                      {...field}
                      placeholder={t('confirm_password')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="h-12 w-full"
              loading={isMutatingResetPassword}
            >
              {t('continue')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
