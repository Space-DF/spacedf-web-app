'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { useTranslations } from 'next-intl'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'
import { toSlug } from '@/utils'
import { useGenerateOrganization } from '@/app/[locale]/(landing)/(withLayout)/organizations/create/hooks/useGenerateOrganization'
import { useSession } from 'next-auth/react'
import { Logo } from '@/components/ui/logo'
import { useEffect } from 'react'
import { UserRound } from 'lucide-react'
import { Warehouse } from '@/components/icons'
import { useOrganizationStore } from '@/stores/organization-store'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Organization Name must be at least 1 characters.',
  }),
  slug_name: z.string().min(1, {
    message: 'Organization Slug Name must be at least 1 characters.',
  }),
})

export type CreateOrganizationSchema = z.infer<typeof formSchema>

const defaultOrganizationName = 'digitalfortress'

export function CreateOrganization() {
  const t = useTranslations('organization')
  const { data: session } = useSession()
  const { trigger: generateOrganizationsMutation } = useGenerateOrganization()
  const { setStep, setOrganizationInfo, organizationName, organizationSlug } =
    useOrganizationStore()
  const { setOrganizationName } = useIdentityStore(
    useShallow(({ setOrganizationName }) => ({ setOrganizationName }))
  )

  const form = useForm<CreateOrganizationSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organizationName,
      slug_name: organizationSlug,
    },
  })

  function onSubmit(values: CreateOrganizationSchema) {
    setOrganizationInfo({
      organizationSlug: values.slug_name,
      organizationName: values.name,
    })
    setStep('template')
  }

  const handleOrganizationNameChange = async (name: string) => {
    const res = await generateOrganizationsMutation({
      payload: { name },
      headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
    })
    console.info(
      `\x1b[34mFunc: handleOrganizationNameChange - PARAMS: res\x1b[0m`,
      res
    )
  }

  useEffect(() => {
    setOrganizationName(organizationSlug || defaultOrganizationName)
  }, [])

  return (
    <div className="flex-1 h-full flex items-center justify-center flex-col gap-3 px-[90px]">
      <div className="w-full">
        <div className="relative size-20">
          <Logo allowAnimation={false} />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] leading-5 text-brand-component-text-dark font-semibold capitalize">
                    {t('organization_name')}
                    <span className="text-brand-component-text-negative">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <InputWithIcon
                      prefixCpn={<UserRound size={16} />}
                      className="border-0"
                      placeholder={t('organization_name')}
                      {...field}
                      onChange={(event) => {
                        const value = event.target.value
                        field.onChange(value)
                        handleOrganizationNameChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] leading-5 text-brand-component-text-dark font-semibold capitalize">
                    {t('organization_slug_name')}
                    <span className="text-brand-component-text-negative">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <InputWithIcon
                      prefixCpn={<Warehouse />}
                      className="border-0"
                      placeholder={t('organization_name')}
                      {...field}
                      onChange={(event) => {
                        const value = toSlug(event.target.value)
                        field.onChange(value)
                        setOrganizationName(value || defaultOrganizationName)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="h-12 min-w-40 text-[16px] rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark font-semibold text-brand-component-text-light-fixed shadow-sm dark:border-brand-component-stroke-light"
            >
              {t('continue')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
