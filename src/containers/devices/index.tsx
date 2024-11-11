import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from '@radix-ui/react-icons'
import { Scanner } from '@yudiel/react-qr-scanner'
import { ArrowLeft, CircleCheck, Pencil, Trash2, Map } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'

import { AddDeviceAuto } from '@/components/icons/add-device-auto'
import { AddDeviceManual } from '@/components/icons/add-device-manual'
import { RightSideBarLayout } from '@/components/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { Switch } from '@/components/ui/switch'
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
      <div className="h-screen overflow-y-auto pb-20">
        <DeviceSelected />
        <DevicesList />
        <Nodata content={t('nodata', { module: t('devices') })} />
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
  const [step, setStep] = useState<Step>('select_mode')
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
              setStep('scan_qr')
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
            isSelected={mode === 'manual'}
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
    <div className="flex items-center justify-center">
      <Dialog
        onOpenChange={() => {
          setStep('select_mode')
        }}
      >
        <DialogTrigger asChild>
          <Button size="default" className="h-8 gap-2 rounded-lg">
            {uppercaseFirstLetter(t('common.add'))} {t('common.devices')}{' '}
            <PlusIcon />
          </Button>
        </DialogTrigger>
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
          <div
            className={cn('flex gap-4 px-4 pb-4', { 'pt-4': !isShowHeader })}
          >
            {steps[step].component}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const DeviceSelected = () => {
  const t = useTranslations('addNewDevice')

  // @TODO: handle device selected
  const deviceSelected = undefined

  const InformationItem = (props: { label: string; content: string }) => {
    return (
      <div className="flex gap-4 text-sm">
        <span className="font-semibold text-brand-text-dark">
          {props.label}
        </span>
        <span className="text-brand-text-gray">{props.content}</span>
      </div>
    )
  }

  if (!deviceSelected) {
    return (
      <div className="rounded-xl bg-brand-fill-dark-soft p-4">
        <Nodata content={t('no_selected_devices')} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-brand-fill-dark-soft p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand-semantic-success" />
          <span className="text-xs font-medium text-brand-text-dark">
            {t('online')}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="icon" className="size-8">
            <Pencil size={16} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                className="size-8 border-2 border-brand-semantic-accent-dark"
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center font-bold text-brand-text-dark">
                  {t('are_you_sure')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-medium text-center text-sm text-brand-text-gray">
                  {t('are_you_sure_you_want_to_remove_this_device')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-12 flex-1 text-brand-text-gray">
                  {t('cancel')}
                </AlertDialogCancel>
                <AlertDialogAction className="h-12 flex-1 border-2 border-brand-semantic-accent-dark bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <InformationItem label={t('device_id')} content={'DMZ 01 12312123'} />
        <InformationItem label={t('site_name')} content={'Jln Ramaya Terawi'} />
        <InformationItem
          label={t('pipe_material')}
          content={'Mild Steel Cement Lined'}
        />
        <InformationItem label={t('pipe_normal_dia_meter')} content={'150'} />
      </div>
    </div>
  )
}

const DevicesList = () => {
  const t = useTranslations('addNewDevice')
  const devices = Array.from({ length: 16 }).map((_, id) => ({ id }))

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-brand-text-dark">
          {t('devices_list')}
        </div>
        <AddDeviceDialog />
      </div>
      <div className="-mx-2 flex flex-wrap gap-y-4">
        {devices.map((item) => (
          <div className="w-1/2 shrink-0 grow-0 basis-1/2 px-2" key={item.id}>
            <div
              className={cn(
                'rounded-xl border border-transparent bg-brand-fill-dark-soft p-2 text-brand-text-dark',
                // TODO: handle border selected
                { 'border-brand-heading': item.id === 0 },
              )}
            >
              <div className="flex items-center justify-between">
                <div className="size-8">
                  <img src="https://placehold.co/32x32" />
                </div>
                <div>
                  <Switch className="bg-brand-fill-gray-light" />
                </div>
              </div>
              <div className="mb-7 mt-2 text-xs font-medium">
                DMZ 01 -1511-M01
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium">
                <Map size={16} className="text-brand-text-gray" />
                Jln Ramaya Terawi
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const AddDeviceScanQR = () => {
  return (
    <div className="aspect-square w-full overflow-hidden rounded-[20px] bg-brand-stroke-gray">
      <Scanner
        onScan={(result) => {
          console.info(`\x1b[34mFunc: Scanner - PARAMS: result\x1b[0m`, result)
        }}
        onError={(err) => {
          console.info(`\x1b[34mFunc: Scanner - PARAMS: err\x1b[0m`, err)
        }}
      />
    </div>
  )
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
  description: z.string().optional(),
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
    console.info(`\x1b[34mFunc: onSubmit - PARAMS: values\x1b[0m`, values)
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
  }

  const isModeAuto = mode === 'auto'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        {isModeAuto && (
          <div className="flex items-center gap-1 bg-brand-semantic-success-light p-2 text-xs font-semibold text-brand-semantic-success">
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
                  className="resize-none"
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
