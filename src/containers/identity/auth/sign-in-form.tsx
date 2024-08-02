import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { InputWithIcon } from "@/components/ui/input"
import {
  TypographyPrimary,
  TypographySecondary,
} from "@/components/ui/typography"
import { usePathname, useRouter } from "@/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { LockKeyhole, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AuthData, AuthenticationMethod } from "."
import { FetchAPI } from "@/lib/fecth"
import { signIn } from "next-auth/react"
import { useFormState } from "react-dom"
import { toast } from "sonner"
import { useTransition } from "react"

const singInSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Please enter a valid email address",
    })
    .max(50, {
      message: "Email must be less than or equal to 50 characters",
    }),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(3, {
      message: "Password must have at least 3 characters",
    })
    .max(150, {
      message: "Password must be less than or equal to 150 characters",
    }),
  remember_me: z.boolean().optional(),
})

const fetchAPI = new FetchAPI()

const SignInForm = ({
  setAuthMethod,
  initialData,
}: {
  setAuthMethod: (data: AuthData) => void
  initialData: AuthData["data"]
}) => {
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
  })

  const [isAuthenticating, startAuthentication] = useTransition()

  const onSubmit = (value: z.infer<typeof singInSchema>) => {
    startAuthentication(async () => {
      try {
        const res = await signIn("credentials", {
          redirect: false,
          email: value.email,
          password: value.password,
        })
        if (!res?.ok) {
          toast.error(res?.error)
        }
      } catch (error) {
        console.log({ error })
      }
    })
  }
  return (
    <div className="self-start w-full animate-opacity-display-effect">
      {/* <p className=" font-semibold">Or continue with email address</p> */}
      <TypographyPrimary className=" font-medium">
        Or continue with email address
      </TypographyPrimary>

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
          <div className="flex justify-between items-center mt-4 mb-5">
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
                        className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs"
                      >
                        Remember me
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <p className="text-xs font-semibold cursor-pointer hover:underline">
              Forgot password?
            </p>
          </div>
          <Button
            type="submit"
            className="w-full h-11 mb-2"
            loading={isAuthenticating}
          >
            Login
          </Button>
        </form>
      </Form>
      <div className="text-center flex items-center justify-center gap-2 text-xs">
        <TypographySecondary className=" font-semibold">
          Don’t have an account?
        </TypographySecondary>
        <span
          className="font-semibold cursor-pointer hover:underline"
          onClick={() =>
            setAuthMethod({
              method: "signUp",
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
