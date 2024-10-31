import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { InputWithIcon } from '@/components/ui/input'
import { TypographyPrimary, TypographySecondary } from '@/components/ui/typography'
import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthData } from '.'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { useTransition } from 'react'
import { passwordSchema } from './sign-up-form'

const singInSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .min(1, { message: 'Email is required' })
    .max(50, { message: 'Email must be less than or equal to 50 characters' }),

  password: passwordSchema,
  remember_me: z.boolean().optional(),
})

const SignInForm = ({
  setAuthMethod,
  initialData,
}: {
  setAuthMethod: (data: AuthData) => void
  initialData: AuthData['data']
}) => {
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
  })

  const [isAuthenticating, startAuthentication] = useTransition()

  const onSubmit = (value: z.infer<typeof singInSchema>) => {
    startAuthentication(async () => {
      try {
        const res = await signIn('credentials', { redirect: false, ...value })
        if (!res?.ok) {
          toast.error(res?.error)
        }
      } catch (error) {
        console.log({ error })
      }
    })
  }
  return (
    <div className="w-full animate-opacity-display-effect self-start">
      {/* <p className=" font-semibold">Or continue with email address</p> */}
      <TypographyPrimary className="font-medium">Or continue with email address</TypographyPrimary>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5">
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              defaultValue={initialData?.email}
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
              defaultValue={initialData?.password}
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
          </div>
          <div className="mb-5 mt-4 flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember_me"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember_me" />

                      <label
                        htmlFor="remember_me"
                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <p className="cursor-pointer text-xs font-semibold hover:underline">Forgot password?</p>
          </div>
          <Button type="submit" className="mb-2 h-11 w-full" loading={isAuthenticating}>
            Login
          </Button>
        </form>
      </Form>
      <div className="flex items-center justify-center gap-2 text-center text-xs">
        <TypographySecondary className="font-semibold">Don’t have an account?</TypographySecondary>
        <span
          className="cursor-pointer font-semibold hover:underline"
          onClick={() =>
            setAuthMethod({
              method: 'signUp',
            })
          }
        >
          Sign up
        </span>
      </div>
    </div>
  )
}

export default SignInForm
