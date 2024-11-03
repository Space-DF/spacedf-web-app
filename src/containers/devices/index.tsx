import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from '@radix-ui/react-icons'
import { ArrowLeft, CircleCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'

import { AddDeviceAuto } from '@/components/icons/add-device-auto'
import { AddDeviceManual } from '@/components/icons/add-device-manual'
import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Nodata } from '@/components/ui/no-data'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useLayout } from '@/stores'
import { uppercaseFirstLetter } from '@/utils'

const Devices = () => {
  const t = useTranslations('common')

  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout),
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  return (
    <RightSideBarLayout
      onClose={() => {
        setCookieDirty(true)
        toggleDynamicLayout('devices')
      }}
      title={t('selected_devices')}
    >
      <Nodata content={t('nodata', { module: t('devices') })} />
      <div className="flex items-center justify-center">
        <Dialog open>
          <DialogTrigger asChild>
            <Button size="default" className="mt-3 gap-2 rounded-lg">
              {uppercaseFirstLetter(t('add'))} {t('devices')} <PlusIcon />
            </Button>
          </DialogTrigger>
          <AddDeviceDialog />
        </Dialog>
      </div>
    </RightSideBarLayout>
  )
}

type Step =
  | 'select_mode'
  | 'scan_qr'
  | 'add_device_auto'
  | 'add_device_manual'
  | 'add_device_success'

type Mode = 'auto' | 'manual'

interface Steps {
  label: string
  component: React.ReactNode
}

const AddDeviceDialog = () => {
  const t = useTranslations()
  const [step, setStep] = useState<Step>('add_device_success')
  // const [step, setStep] = useState<Step>('select_mode')
  const [mode, setMode] = useState<Mode>('auto')

  const steps: Record<Step, Steps> = {
    select_mode: {
      label: `${uppercaseFirstLetter(t('common.add'))} ${t('common.devices')}`,
      component: (
        <>
          <AddDeviceContainer
            icon={<AddDeviceAuto />}
            title={t('addNewDevice.auto')}
            description={t('addNewDevice.auto_scan_devices_near_you')}
            handleNextStep={() => {
              setStep('add_device_auto')
              setMode('auto')
            }}
            isSelected={mode === 'auto'}
            isRecommended
          />
          <AddDeviceContainer
            icon={<AddDeviceManual />}
            title={t('addNewDevice.manual')}
            description={t('addNewDevice.connect_devices_manual')}
            handleNextStep={() => {
              setStep('add_device_manual')
              setMode('manual')
            }}
            isSelected={mode === 'auto'}
          />
        </>
      ),
    },
    scan_qr: {
      label: t('addNewDevice.scan_qr_code'),
      component: <AddDeviceScanQR />,
    },
    add_device_auto: {
      label: t('addNewDevice.device_informations'),
      component: <AddDeviceForm mode={mode} />,
    },
    add_device_manual: {
      label: t('addNewDevice.add_devices_manually'),
      component: <AddDeviceForm mode={mode} />,
    },
    add_device_success: {
      label: '',
      component: <AddDeviceSuccess />,
    },
  }

  const isShowArrow = !['select_mode', 'add_device_success'].includes(step)
  const isShowHeader = step !== 'add_device_success'

  const handleBackButton = () => {
    const prevStep = step === 'add_device_auto' ? 'scan_qr' : 'select_mode'
    setStep(prevStep)
  }

  return (
    <DialogContent className="sm:max-w-[530px]">
      {isShowHeader && (
        <DialogHeader className="border-0">
          <DialogTitle className="flex items-center gap-2.5">
            {isShowArrow && (
              <ArrowLeft
                className="cursor-pointer"
                onClick={handleBackButton}
                size={20}
              />
            )}
            {steps[step].label}
          </DialogTitle>
        </DialogHeader>
      )}
      <div className={cn('flex gap-4 px-4 pb-4', { 'pt-4': !isShowHeader })}>
        {steps[step].component}
      </div>
    </DialogContent>
  )
}

const AddDeviceScanQR = () => {
  return <div className="rounded-[20px] bg-brand-stroke-gray"></div>
}

const AddDeviceSuccess = () => {
  const t = useTranslations('addNewDevice')
  return (
    <div className="w-full">
      {/* TODO: add image device */}
      <div className="my-4 flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-brand-text-dark">
          <CircleCheck
            size={36}
            fill="currentColor"
            stroke="white"
            className="text-brand-semantic-success"
          />{' '}
          {t('congratulations')}
        </div>
        <div className="text-sm font-medium text-brand-text-gray">
          {t.rich('you_have_successfully_added_the_gps_tracker_to_the_space', {
            device: 'GPS Tracker',
            span: (chunk) => (
              <span className="font-semibold text-brand-text-dark">
                {chunk}
              </span>
            ),
          })}
        </div>
      </div>
      <DialogClose asChild>
        <Button className="h-12 w-full">{t('done')}</Button>
      </DialogClose>
    </div>
  )
}

const addDeviceSchema = z.object({
  device_name: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  dev_ui: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  description: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
})

const AddDeviceForm = ({
  mode,
  defaultValues,
}: {
  mode: Mode
  defaultValues?: z.infer<typeof addDeviceSchema>
}) => {
  const t = useTranslations('addNewDevice')
  const form = useForm<z.infer<typeof addDeviceSchema>>({
    resolver: zodResolver(addDeviceSchema),
    defaultValues,
  })

  function onSubmit(values: z.infer<typeof addDeviceSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  const isModeAuto = mode === 'auto'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        {isModeAuto && (
          <div className="text-brand-semantic-success bg-brand-semantic-success-light flex items-center gap-1 p-2 text-xs font-semibold">
            <CircleCheck size={16} />
            {t('scan_qr_code_successfully')}
          </div>
        )}
        <FormField
          control={form.control}
          name="device_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-text-dark dark:text-white">
                {t('device_name')}
                <span className="text-brand-semantic-accent">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  disabled={isModeAuto}
                  placeholder="00 04 A3 0B  00 1B B0 DF"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dev_ui"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-text-dark dark:text-white">
                {t('devui')}
                <span className="text-brand-semantic-accent">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  disabled={isModeAuto}
                  placeholder="00 04 A3 0B  00 1B B0 DF"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isModeAuto}
                  placeholder={t('enter_description')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            {t('cancel')}
          </Button>
          <Button type="submit">{t('add_device')}</Button>
        </div>
      </form>
    </Form>
  )
}

interface AddDeviceContainerProps {
  title: string
  description: string
  isSelected?: boolean
  isRecommended?: boolean
  icon: React.ReactNode
  handleNextStep: () => void
}

const AddDeviceContainer = (
  props: React.PropsWithChildren<AddDeviceContainerProps>,
) => {
  const {
    icon,
    isRecommended,
    isSelected,
    title,
    description,
    handleNextStep,
  } = props

  return (
    <div
      className={cn(
        'relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-brand-fill-dark-soft px-4 py-10 text-center',
        { 'border-black': isSelected },
      )}
      onClick={handleNextStep}
    >
      {isRecommended && (
        <div className="absolute right-2 top-2 rounded bg-brand-fill-outermost px-2 py-px text-xs font-semibold text-white">
          Recommend
        </div>
      )}
      {icon}
      <div className="font-semibold">{title}</div>
      <div className="text-[13px] text-brand-text-gray">{description}</div>
    </div>
  )
}

export default memo(Devices)
