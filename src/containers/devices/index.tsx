import { zodResolver } from '@hookform/resolvers/zod'
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner'
import {
  ArrowLeft,
  CircleCheck,
  Ellipsis,
  LoaderCircle,
  Map,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, {
  memo,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { useShallow } from 'zustand/react/shallow'
import DeviceIcon from '/public/images/device-icon.webp'
import DeviceTracki from '/public/images/device-tracki.webp'

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
import DeviceDetail from './components/device-detail'
import Image from 'next/image'
import CircleCheckSvg from '/public/images/circle-check.svg'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useAddDeviceManually } from './hooks/useAddDeviceManually'
import { toast } from 'sonner'
import { DeviceSpace } from '@/types/device-space'
import { KeyedMutator } from 'swr'
import { usePrevious } from '@/hooks/usePrevious'
import { useCheckClaimCode } from './hooks/useCheckClaimCode'
import { countTwoDigitNumbers, formatValueEUI } from './utils'
import { useVirtualizer } from '@tanstack/react-virtual'

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

  const previousDeviceSelected = usePrevious(deviceSelected)

  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))
  // const [selected, setSelected] = useState<number>()

  const handleCloseSlide = () => {
    setDeviceSelected('')
  }

  useEffect(() => {
    handleDeviceTabVisible()
  }, [deviceSelected, previousDeviceSelected, JSON.stringify(dynamicLayouts)])

  const handleDeviceTabVisible = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (deviceSelected) {
      const isDeviceShow = dynamicLayouts.includes(NavigationEnums.DEVICES)

      if (!isDeviceShow) {
        const newLayout = getNewLayouts(dynamicLayouts, NavigationEnums.DEVICES)

        setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)

        toggleDynamicLayout(NavigationEnums.DEVICES)
      }
    }
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

      <div className="flex h-full flex-col pt-4">
        <div>
          <DeviceSelected />
        </div>
        <DevicesList />
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

interface Props {
  mutate: KeyedMutator<DeviceSpace[]>
}

const AddDeviceDialog: React.FC<Props> = ({ mutate }) => {
  const t = useTranslations()
  const [step, setStep] = useState<Step>('select_mode')
  const [mode, setMode] = useState<Mode>('auto')
  const [open, setOpen] = useState(false)

  const setOpenDrawerIdentity = useIdentityStore(
    useShallow((state) => state.setOpenDrawerIdentity)
  )
  const isAuth = useAuthenticated()

  const form = useForm<AddDeviceSchema>({
    resolver: zodResolver(addDeviceSchema),
  })

  const handleReset = (value: boolean) => {
    setStep('select_mode')
    setMode('auto')
    form.reset()
    setOpen(value)
  }

  const handleAddDeviceSuccess = async () => {
    await mutate()
    setStep('add_device_success')
  }

  const isAutoMode = mode === 'auto'

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
      component: <AddDeviceScanQR setStep={setStep} />,
    },
    add_device_auto: {
      label: t('addNewDevice.device_informations'),
      component: (
        <AddDeviceForm
          mode={mode}
          onSuccess={handleAddDeviceSuccess}
          onClose={() => handleReset(false)}
        />
      ),
    },
    add_device_manual: {
      label: t(
        isAutoMode
          ? 'addNewDevice.device_informations'
          : 'addNewDevice.add_devices_manually'
      ),
      component: (
        <AddDeviceForm
          mode={mode}
          onSuccess={handleAddDeviceSuccess}
          onClose={() => handleReset(false)}
        />
      ),
    },
    add_device_success: {
      label: '',
      component: <AddDeviceSuccess onReset={() => handleReset(false)} />,
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
      <Dialog open={open} onOpenChange={handleReset}>
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
            <FormProvider {...form}>{steps[step].component}</FormProvider>
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
                <AlertDialogTitle className="text-center font-bold text-brand-component-text-dark">
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
            content={deviceData?.id}
          />
          <InformationItem
            label={`${t('device_name')}:`}
            content={deviceData?.name}
          />
          <InformationItem
            label={`${t('deveui')}:`}
            content={'Mild Steel Cement Lined'}
          />
          <InformationItem label={`${t('description')}:`} content={'150'} />
        </div>

        <Button onClick={() => startDrawHistory()}>
          {t('device_history')}
        </Button>
      </div>
    </div>
  )
}

const DevicesList = () => {
  const t = useTranslations('addNewDevice')
  const {
    data: devices = [],
    mutate,
    isReachingEnd,
    isLoading,
    setSize,
  } = useGetDevices()

  const { deviceSelected, setDeviceSelected } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
      setDeviceSelected: state.setDeviceSelected,
      setDevices: state.setDevices,
    }))
  )

  const parentRef = useRef<HTMLDivElement>(null)
  const fetchingRef = useRef(false)

  const rowCount = Math.ceil(devices.length / 2)

  const rowVirtualizer = useVirtualizer({
    count: isReachingEnd ? rowCount : rowCount + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 106,
    overscan: 5,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse()

    if (!lastItem) return

    if (
      lastItem.index >= rowCount - 1 &&
      !isLoading &&
      !isReachingEnd &&
      !fetchingRef.current
    ) {
      fetchingRef.current = true
      setSize((prevSize) => prevSize + 1)
    }
  }, [virtualItems.length, rowCount, isLoading, isReachingEnd, setSize])

  // Reset fetching ref when loading completes
  useEffect(() => {
    if (!isLoading) {
      fetchingRef.current = false
    }
  }, [isLoading])

  return (
    <div className="mt-6 flex flex-1 flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-brand-component-text-dark">
          {t('devices_list')}
        </div>
        <AddDeviceDialog mutate={mutate} />
      </div>
      <InputWithIcon
        prefixCpn={
          <Search size={18} className="text-brand-component-text-gray" />
        }
        placeholder={t('device')}
        wrapperClass="w-full"
      />
      <div
        className="flex max-h-[60dvh] overflow-y-auto h-dvh scroll-smooth [&::-webkit-scrollbar-thumb]:border-r-4 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]"
        ref={parentRef}
      >
        <div className="flex-1 transition-all duration-300">
          <div
            className="relative w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {virtualItems.map((virtualRow) => {
              const startIndex = virtualRow.index * 2
              const endIndex = Math.min(startIndex + 2, devices.length)
              const rowDevices = devices.slice(startIndex, endIndex)

              // Show loading indicator for the last row when loading more
              if (virtualRow.index === rowCount && isLoading) {
                return (
                  <div
                    key={virtualRow.key}
                    className="absolute top-0 left-0 w-full flex items-center justify-center"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <LoaderCircle className="text-brand-bright-lavender size-6 animate-spin" />
                  </div>
                )
              }

              return (
                <div
                  key={virtualRow.key}
                  className="absolute top-0 left-0 w-full grid grid-cols-2 gap-1"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {rowDevices.map((device) => (
                    <div
                      key={device.id}
                      className={cn(
                        'cursor-pointer h-fit rounded-md border border-transparent bg-brand-component-fill-gray-soft p-2 text-brand-component-text-dark',
                        {
                          'border-brand-component-stroke-dark':
                            device?.id === deviceSelected,
                        }
                      )}
                      onClick={() => setDeviceSelected(device?.id)}
                    >
                      <div className="space-y-2 mb-2">
                        <div className="flex items-start justify-between">
                          <div className="size-8">
                            <ImageWithBlur
                              src={DeviceIcon}
                              alt="DMZ 01 -1511-M01"
                            />
                          </div>
                          <Ellipsis
                            size={16}
                            className="text-brand-component-text-gray"
                          />
                        </div>
                        <div className="text-xs font-medium">
                          <span className="leading-[18px] line-clamp-1">
                            {device.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium ">
                        <Map size={16} className="text-brand-text-gray" />
                        <span className="leading-[18px]">
                          {device.device.lorawan_device.location || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AddDeviceScanQRProps {
  setStep: Dispatch<SetStateAction<Step>>
}

const AddDeviceScanQR: React.FC<AddDeviceScanQRProps> = ({ setStep }) => {
  const { trigger: checkClaimCode, isMutating } = useCheckClaimCode()
  const t = useTranslations('addNewDevice')

  const form = useFormContext<AddDeviceSchema>()

  const handleScan = async (result: IDetectedBarcode[]) => {
    const response = await checkClaimCode(result[0].rawValue, {
      onError: (error) => {
        toast.error(error.message || t('failed_to_scan_qr_code'))
      },
    })
    form.setValue('dev_eui', formatValueEUI(response.lorawan_device.dev_eui))
    setStep('add_device_manual')
  }

  const handleError = () => {
    toast.error(t('failed_to_scan_qr_code'))
  }

  return (
    <div className="aspect-square w-full overflow-hidden rounded-[20px] bg-brand-stroke-gray relative">
      <Scanner
        allowMultiple
        onScan={handleScan}
        onError={handleError}
        paused={isMutating}
      />
      {isMutating && (
        <div className="absolute size-full justify-center flex items-center z-10 bg-black/70 backdrop-blur-sm top-0 left-0">
          <LoaderCircle className="text-brand-bright-lavender size-10 animate-spin" />
        </div>
      )}
    </div>
  )
}

interface AddDeviceSuccessProps {
  onReset: () => void
}

const AddDeviceSuccess: React.FC<AddDeviceSuccessProps> = ({ onReset }) => {
  const t = useTranslations('addNewDevice')

  const form = useFormContext<AddDeviceSchema>()

  const deviceName = form.getValues('name')

  return (
    <div className="w-full">
      <div className="flex justify-center w-full">
        <Image
          src={DeviceTracki}
          alt="DMZ 01 -1511-M01"
          width={208}
          height={208}
          className="size-52"
        />
      </div>
      <div className="my-4 flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-brand-component-text-dark">
          <Image
            src={CircleCheckSvg}
            width={30}
            height={30}
            alt="image"
            className="size-7"
          />{' '}
          {t('congratulations')}
        </div>
        <div className="text-sm font-medium text-brand-component-text-gray">
          {t.rich('you_have_successfully_added_the_gps_tracker_to_the_space', {
            device: deviceName,
            span: (chunk) => (
              <span className="font-semibold text-brand-component-text-dark">
                {chunk}
              </span>
            ),
          })}
        </div>
      </div>
      <DialogClose asChild>
        <Button className="h-12 w-full" onClick={onReset}>
          {t('done')}
        </Button>
      </DialogClose>
    </div>
  )
}

const addDeviceSchema = z.object({
  name: z.string({ message: 'This field cannot be empty' }),
  dev_eui: z
    .string({ message: 'This field cannot be empty' })
    .min(16, {
      message: 'Must be at least 16 characters long.',
    })
    .refine(
      (str) => {
        const numbers = str.split(' ')
        const twoDigitCount = numbers.filter((num) => num.length === 2).length
        return twoDigitCount === 8
      },
      {
        message: 'Dev EUI must be 8 bytes',
      }
    ),
  description: z
    .string()
    .max(500, { message: 'This field must not exceed 500 characters' })
    .optional(),
})

export type AddDeviceSchema = z.infer<typeof addDeviceSchema>

const AddDeviceForm = ({
  mode,
  onSuccess,
  onClose,
}: {
  mode: Mode
  onSuccess: () => Promise<void>
  onClose: () => void
}) => {
  const t = useTranslations('addNewDevice')
  const form = useFormContext<AddDeviceSchema>()
  const { trigger: addDevice, isMutating } = useAddDeviceManually()

  async function onSubmit(values: AddDeviceSchema) {
    await addDevice(
      { ...values, dev_eui: values.dev_eui.replace(/\s+/g, '') },
      {
        onSuccess: async () => {
          await onSuccess()
          toast.success(t('add_device_successfully'))
        },
        onError: (error) =>
          toast.error(error.message || t('failed_to_add_device')),
      }
    )
  }

  const isModeAuto = mode === 'auto'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        {isModeAuto && (
          <div className="flex items-center gap-1 bg-brand-component-fill-positive-soft p-2 text-xs font-semibold text-brand-semantic-success rounded-sm">
            <CircleCheck size={16} />
            {t('scan_qr_code_successfully')}
          </div>
        )}
        <FormField
          control={form.control}
          name="dev_eui"
          render={({ field, fieldState }) => (
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
                  value={field.value}
                  onChange={(e) => {
                    const rawValue = e.target.value
                      .replace(/\s/g, '')
                      .toUpperCase()

                    if (/^[0-9A-Fa-f]*$/.test(rawValue)) {
                      const binaryValue = formatValueEUI(rawValue)

                      if (
                        countTwoDigitNumbers(binaryValue) <= 8 &&
                        binaryValue.split(' ').length <= 8
                      ) {
                        field.onChange(binaryValue)
                      }
                    }
                  }}
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-component-text-dark">
                {t('device_name')}
                <span className="text-brand-component-text-accent">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Device 1"
                  {...field}
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-component-text-dark">
                {t('description')}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('enter_description')}
                  className="resize-none"
                  {...field}
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" loading={isMutating}>
            {t('add_device')}
          </Button>
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
