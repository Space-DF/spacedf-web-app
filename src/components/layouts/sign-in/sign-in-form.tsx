import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input, InputWithIcon } from "@/components/ui/input"
import { LockKeyhole, Mail } from "lucide-react"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import {
  TypographyPrimary,
  TypographySecondary,
} from "@/components/ui/typography"

const singInSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Please enter a valid email address",
    }),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, {
      message: "Password must have at least 8 characters",
    }),
  remember_me: z.boolean(),
})

const SignInForm = () => {
  const form = useForm<z.infer<typeof singInSchema>>({
    resolver: zodResolver(singInSchema),
  })

  const onSubmit = (value: z.infer<typeof singInSchema>) => {
    console.log({ value })
  }
  return (
    <div className="self-start w-full">
      {/* <p className=" font-semibold">Or continue with email address</p> */}
      <TypographyPrimary className=" font-semibold">
        Or continue with email address
      </TypographyPrimary>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 mt-5 mb-2"
        >
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

                <FormMessage className="" />
              </FormItem>
            )}
          />
          <div className="flex justify-between items-center">
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
        <span className="font-semibold cursor-pointer hover:underline">
          Sign up
        </span>
      </div>
    </div>
  )
}

export default SignInForm
