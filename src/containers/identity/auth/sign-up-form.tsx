import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { InputWithIcon } from '@/components/ui/input'
import {
  TypographyPrimary,
  TypographySecondary,
} from '@/components/ui/typography'
import { FetchAPI } from '@/lib/fecth'
import { uppercaseFirstLetter } from '@/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthData } from '.'
import { SignUpResponse } from '../types/response'
import { signIn } from 'next-auth/react'
import { useState, useTransition } from 'react'

export const singInSchema = z
  .object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({
        message: 'Please enter a valid email address',
      })
      .max(50, {
        message: 'Email must be less than or equal to 50 characters',
      }),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(3, {
        message: 'Password must have at least 3 characters',
      })
      .max(150, {
        message: 'Password must be less than or equal to 150 characters',
      }),

    confirm_password: z
      .string({
        required_error: 'Confirm password is required',
      })
      .max(150, {
        message: 'Password must be less than or equal to 150 characters',
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password do not match',
    path: ['confirm_password'],
  })

const fetchAPI = new FetchAPI()

const SignUpForm = ({
  setAuthMethod,
}: {
  setAuthMethod: (data: AuthData) => void
}) => {
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
  })

  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const onSubmit = async (value: z.infer<typeof singInSchema>) => {
    setIsAuthenticating(true)
    try {
      await toast.promise(
        fetchAPI.post<SignUpResponse>('api/auth/register', {
          email: value.email,
          password: value.password,
        }),
        {
          loading: 'Signing up...',
          finally() {
            setIsAuthenticating(false)
          },
          success: (res) => {
            if (res.status === 201) {
              signIn('credentials', {
                redirect: false,
                sigUpSuccessfully: true,
                dataUser: JSON.stringify({
                  ...res.response_data.user,
                  accessToken: res.response_data.access,
                  refreshToken: res.response_data.refresh,
                }),
              })

              return 'Sign up successful!'
            }
          },
          error: (error: any) => {
            return (
              (error.message?.email?.[0] &&
                uppercaseFirstLetter(error.message?.email?.[0])) ||
              'Something went wrong'
            )
          },
        },
      )
    } catch (error) {}
  }

  return (
    <div className="w-full animate-opacity-display-effect self-start">
      {/* <p className=" font-semibold">Or continue with email address</p> */}
      <TypographyPrimary className="font-medium">
        Or continue with email address
      </TypographyPrimary>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">Email</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      prefixCpn={<Mail size={16} />}
                      {...field}
                      placeholder="Email"
                      className=""
                    />
                  </FormControl>

                  <FormMessage className="" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">Password</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      type="password"
                      prefixCpn={<LockKeyhole size={16} />}
                      {...field}
                      placeholder="Password"
                      className=""
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="">Confirm password</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      type="password"
                      prefixCpn={<LockKeyhole size={16} />}
                      {...field}
                      placeholder="Password"
                      className=""
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="mb-2 mt-5 h-11 w-full"
            loading={isAuthenticating}
          >
            Sign up
          </Button>
        </form>
      </Form>
      <div className="flex items-center justify-center gap-2 text-center text-xs">
        <TypographySecondary className="font-semibold">
          Already have an account?
        </TypographySecondary>
        <span
          className="cursor-pointer font-semibold hover:underline"
          onClick={() => {
            setAuthMethod({
              method: 'signIn',
            })
          }}
        >
          Sign in
        </span>
      </div>
    </div>
  )
}

export default SignUpForm
