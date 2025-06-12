import { zodResolver } from '@hookform/resolvers/zod'
import { Scanner } from '@yudiel/react-qr-scanner'
import {
  ArrowLeft,
  CircleCheck,
  Ellipsis,
  Map,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'
import DeviceIcon from '/public/images/device-icon.webp'

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
} from '@/components/ui/dialog'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import ImageWithBlur from '@/components/ui/image-blur'
import { Input, InputWithIcon } from '@/components/ui/input'
import { Nodata } from '@/components/ui/no-data'
import { Textarea } from '@/components/ui/textarea'
import { COOKIES, NavigationEnums } from '@/constants'
import { useDeviceHistory } from '@/hooks/useDeviceHistory'
import { useGetDevices } from '@/hooks/useDevices'
import { cn } from '@/lib/utils'
import { getNewLayouts, useLayout } from '@/stores'
import { useDeviceStore } from '@/stores/device-store'
import { useIdentityStore } from '@/stores/identity-store'
import { setCookie, uppercaseFirstLetter } from '@/utils'
import { useSession } from 'next-auth/react'
import DeviceDetail from './components/device-detail'
import Image from 'next/image'

const Devices = () => {
  const t = useTranslations('common')

  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )
  const { setDeviceSelected, deviceSelected } = useDeviceStore(
    useShallow((state) => ({
      setDeviceSelected: state.setDeviceSelected,
      deviceSelected: state.deviceSelected,
    }))
  )

  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))
  // const [selected, setSelected] = useState<number>()

  const handleCloseSlide = () => {
    setDeviceSelected('')
  }

  return (
    <RightSideBarLayout
      onClose={() => {
        const newLayout = getNewLayouts(dynamicLayouts, NavigationEnums.DEVICES)
        setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
        setCookieDirty(true)
        toggleDynamicLayout('devices')
        setDeviceSelected('')
      }}
      className="relative"
      title={t('selected_devices')}
    >
      <DeviceDetail onClose={handleCloseSlide} open={!!deviceSelected} />

      <div className="flex h-full flex-col pt-6">
        <div>
          <DeviceSelected />
        </div>
        <DevicesList
        // selected={selected}
        // handleSelected={(id: number) => setSelected(id)}
        />
        {/*<Nodata content={t('nodata', { module: t('devices') })} />*/}
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
  const [open, setOpen] = useState(false)

  const setOpenDrawerIdentity = useIdentityStore(
    useShallow((state) => state.setOpenDrawerIdentity)
  )
  const { status } = useSession()
  const isAuth = status === 'authenticated'

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
      <Button
        className="h-8 gap-x-2"
        onClick={() => {
          if (!isAuth) {
            setOpenDrawerIdentity(true)
            return
          }
          setOpen(true)
        }}
      >
        <span className="text-xs font-semibold leading-4">
          {uppercaseFirstLetter(t('common.add'))} {t('common.devices')}{' '}
        </span>
        <Image src={'/images/plus.svg'} alt="plus" width={16} height={16} />
      </Button>
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open)
          setStep('select_mode')
        }}
      >
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

  const { deviceSelected, devices } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
      devices: state.devices,
      setDeviceSelected: state.setDeviceSelected,
    }))
  )

  const { startDrawHistory } = useDeviceHistory()

  const InformationItem = (props: { label: string; content: string }) => {
    return (
      <div className="flex gap-4 text-sm">
        <span className="font-semibold text-brand-component-text-dark">
          {props.label}
        </span>
        <span className="text-brand-component-text-gray">{props.content}</span>
      </div>
    )
  }

  // if (!isAuth) {
  //   return (
  //     <div className="flex flex-col gap-3 rounded-xl bg-brand-component-fill-gray-soft p-4">
  //       <div className="flex items-center justify-between">
  //         <div className="flex items-center gap-2">
  //           <span className="size-2 rounded-full bg-brand-component-fill-positive" />
  //           <span className="text-xs font-medium text-brand-component-text-dark">
  //             {t('online')}
  //           </span>
  //         </div>
  //         <div className="flex gap-2">
  //           <Button
  //             size="icon"
  //             className="size-8"
  //             onClick={() => {
  //               setOpenDrawerIdentity(true)
  //             }}
  //           >
  //             <Pencil size={16} />
  //           </Button>
  //           <Button
  //             size="icon"
  //             variant="destructive"
  //             className="size-8 border-2 border-brand-semantic-accent-dark"
  //             onClick={() => {
  //               setOpenDrawerIdentity(true)
  //             }}
  //           >
  //             <Trash2 size={16} />
  //           </Button>
  //         </div>
  //       </div>
  //       <div className="flex flex-col gap-2">
  //         <InformationItem
  //           label={`${t('device_id')}:`}
  //           content={'DMZ 01 12312123'}
  //         />
  //         <InformationItem
  //           label={`${t('device_name')}:`}
  //           content={'DF Sticker Tracker'}
  //         />
  //         <InformationItem
  //           label={`${t('deveui')}`}
  //           content={'A591DEA6EB25DB6C'}
  //         />
  //         <InformationItem label={`${t('description')}:`} content={'Bus'} />
  //       </div>
  //     </div>
  //   )
  // }

  if (!deviceSelected) {
    return (
      <div className="rounded-xl bg-brand-component-fill-gray-soft">
        <Nodata content={t('no_selected_devices')} />
      </div>
    )
  }

  const deviceData = devices[deviceSelected]

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-brand-component-fill-gray-soft p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand-component-fill-positive" />
          <span className="text-xs font-medium text-brand-component-text-dark">
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
            <AlertDialogContent className="sm:max-w-md sm:rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center font-bold text-brand-text-dark">
                  {t('remove_device')}
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
        <div className="flex flex-col gap-2 gap-y-1">
          <InformationItem
            label={`${t('device_id')}:`}
            content={deviceData.id}
          />
          <InformationItem
            label={`${t('device_name')}:`}
            content={deviceData.name}
          />
          <InformationItem
            label={`${t('deveui')}:`}
            content={'Mild Steel Cement Lined'}
          />
          <InformationItem label={`${t('description')}:`} content={'150'} />
        </div>

        <Button onClick={() => startDrawHistory(deviceSelected)}>
          {t('device_history')}
        </Button>
      </div>
    </div>
  )
}

const DevicesList = () => {
  const t = useTranslations('addNewDevice')
  const { data } = useGetDevices()
  const devices = Object.values(data || {}) || []

  const { deviceSelected, setDeviceSelected } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
      setDeviceSelected: state.setDeviceSelected,
    }))
  )

  return (
    <div className="mt-6 flex flex-1 flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-brand-component-text-dark">
          {t('devices_list')}
        </div>
        <AddDeviceDialog />
      </div>
      <InputWithIcon
        prefixCpn={
          <Search size={18} className="text-brand-component-text-gray" />
        }
        placeholder={t('device')}
        wrapperClass="w-full"
      />
      <div className="flex-1 h-full flex">
        <div className="px-2.5 flex-1 transition-all duration-300 overflow-y-auto scroll-smooth [&::-webkit-scrollbar-thumb]:border-r-4 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]">
          <div className="-mx-2 grid grid-cols-2 gap-1 pb-6">
            {devices.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'cursor-pointer rounded-md border border-transparent bg-brand-component-fill-gray-soft p-2 text-brand-component-text-dark',
                  {
                    'border-brand-component-stroke-dark':
                      item.id === deviceSelected,
                  }
                )}
                onClick={() => setDeviceSelected(item.id)}
              >
                <div className="space-y-2 mb-2">
                  <div className="flex items-start justify-between">
                    <div className="size-8">
                      <ImageWithBlur src={DeviceIcon} alt="DMZ 01 -1511-M01" />
                    </div>
                    <Ellipsis
                      size={16}
                      className="text-brand-component-text-gray"
                    />
                  </div>
                  <div className="text-xs font-medium">
                    <span className="leading-[18px]">{item.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium ">
                  <Map size={16} className="text-brand-text-gray" />
                  <span className="leading-[18px]">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
  device_name: z.string({ message: 'This field cannot be empty' }),
  dev_eui: z.string({ message: 'This field cannot be empty' }).min(16, {
    message: 'Must be at least 16 characters long.',
  }),
  join_eui: z.string({ message: 'This field cannot be empty' }).min(16, {
    message: 'Must be at least 16 characters long.',
  }),
  description: z
    .string()
    .max(500, { message: 'This field must not exceed 500 characters' })
    .optional(),
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
          name="dev_eui"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-component-text-dark">
                {t('devui')}
                <span className="text-brand-component-text-accent">*</span>
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
          name="join_eui"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-component-text-dark">
                {t('joineui')}
                <span className="text-brand-component-text-accent">*</span>
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
          name="device_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-component-text-dark">
                {t('device_name')}
                <span className="text-brand-component-text-accent">*</span>
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
              <FormLabel className="font-semibold text-brand-component-text-dark">
                {t('description')}
              </FormLabel>
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
  props: React.PropsWithChildren<AddDeviceContainerProps>
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
        'relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-brand-component-fill-gray-soft px-4 py-10 text-center',
        { 'border-brand-component-stroke-dark': isSelected }
      )}
      onClick={handleNextStep}
    >
      {isRecommended && (
        <div className="absolute right-2 top-2 rounded bg-brand-fill-outermost px-2 py-px text-xs font-semibold text-white">
          Recommend
        </div>
      )}
      {icon}
      <div className="font-semibold text-brand-component-text-dark">
        {title}
      </div>
      <div className="text-[13px] text-brand-component-text-gray">
        {description}
      </div>
    </div>
  )
}

export default memo(Devices)
