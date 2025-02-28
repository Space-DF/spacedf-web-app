'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'
import { useEffect, useState } from 'react'
import { OctagonAlert, UserRound } from 'lucide-react'

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
import { Logo } from '@/components/ui/logo'
import { Warehouse } from '@/components/icons'
import { toSlug } from '@/utils'
import { useIdentityStore } from '@/stores/identity-store'
import { useOrganizationStore } from '@/stores/organization-store'
import {
  OrganizationSlug,
  useGenerateOrganization,
} from '../hooks/useGenerateOrganization'
import { useCheckSlugUniqueOrganization } from '../hooks/useSlugUniqueOrganization'
import { cn } from '@/lib/utils'

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
  const [isShowSlugsSuggestion, setShowSlugsSuggestion] = useState(false)
  const [slugsSuggestion, setSlugsSuggestion] = useState<OrganizationSlug[]>([])
  const { trigger: generateOrganizationsMutation } = useGenerateOrganization()
  const { trigger: checkSlugUniqueOrganizationMutation, isMutating } =
    useCheckSlugUniqueOrganization()
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

  async function onSubmit(values: CreateOrganizationSchema) {
    try {
      await checkSlugUniqueOrganizationMutation({ slug_name: values.slug_name })
      setOrganizationInfo({
        organizationSlug: values.slug_name,
        organizationName: values.name,
      })
      setStep('template')
    } catch {
      await handleOrganizationNameChange(values.name)
      form.setError('slug_name', { message: t('this_slug_name_is_taken') })
      setShowSlugsSuggestion(true)
    }
  }

  const handleOrganizationNameChange = async (name: string) => {
    try {
      const { data } = await generateOrganizationsMutation({ name })
      const res = data?.response_data
      const suggestionList = Array.isArray(res)
        ? res
        : [
            res,
            ...Array.from({ length: 5 }).map((_, i) => ({
              generated_slug_name: `${res?.generated_slug_name}-${new Date().getTime()}${i}`,
              original_name: res?.original_name,
            })),
          ]

      setSlugsSuggestion(suggestionList as OrganizationSlug[])
    } catch (err) {
      console.log(`Func: handleOrganizationNameChange - PARAMS: err`, err)
    }
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
                        setShowSlugsSuggestion(false)
                        const value = event.target.value
                        field.onChange(value)
                        form.setValue('slug_name', toSlug(value))
                        setOrganizationName(
                          toSlug(value) || defaultOrganizationName
                        )
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
                <FormItem className="relative">
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
                        setShowSlugsSuggestion(false)
                        const value = toSlug(event.target.value)
                        field.onChange(value)
                        setOrganizationName(value || defaultOrganizationName)
                      }}
                      onFocus={() => setShowSlugsSuggestion(true)}
                      onBlur={() => setShowSlugsSuggestion(false)}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage
                    icon={<OctagonAlert size={16} />}
                    className="text-xs"
                  />
                  {isShowSlugsSuggestion && (
                    <div className="absolute top-full inset-x-0 border border-brand-component-stroke-dark-soft bg-brand-component-fill-light rounded-lg shadow-suggestion p-2 flex flex-col gap-3">
                      <div className="font-semibold text-brand-component-text-dark text-[14px] leading-5">
                        {t('available_slug_name')}
                      </div>
                      <div>
                        {slugsSuggestion.map((item) => (
                          <div
                            key={item.generated_slug_name}
                            className={cn(
                              'p-2 rounded-md text-brand-component-text-dark text-[14px] leading-5 cursor-pointer',
                              {
                                'bg-brand-component-fill-dark-soft':
                                  item.generated_slug_name === field.value,
                              }
                            )}
                            onClick={() => {
                              field.onChange(item.generated_slug_name)
                              setOrganizationName(item.generated_slug_name)
                              setShowSlugsSuggestion(false)
                            }}
                          >
                            {item.generated_slug_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
            <Button
              disabled={isMutating}
              loading={isMutating}
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
