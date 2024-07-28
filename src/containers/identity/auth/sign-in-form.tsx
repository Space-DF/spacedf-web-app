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
import { AuthenticationMethod } from "."
import { FetchAPI } from "@/lib/fecth"

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
    .min(8, {
      message: "Password must have at least 8 characters",
    })
    .max(150, {
      message: "Password must be less than or equal to 150 characters",
    }),
  remember_me: z.boolean(),
})

const fetchAPI = new FetchAPI()

const SignInForm = ({
  setAuthMethod,
}: {
  setAuthMethod: (method: AuthenticationMethod) => void
}) => {
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
  })

  const onSubmit = async (value: z.infer<typeof singInSchema>) => {
    // try {
    //   const res = await fetchAPI.post("auth/register", {
    //     email: value.email,
    //     password: value.password,
    //   })
    // } catch (error) {}
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
          <Button type="submit" className="w-full h-11 mb-2">
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
          onClick={() => setAuthMethod("signUp")}
        >
          Sign up
        </span>
      </div>
    </div>
  )
}

export default SignInForm
