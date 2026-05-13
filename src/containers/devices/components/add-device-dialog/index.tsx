import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useIdentityStore } from '@/stores/identity-store'
import { useAddDeviceStore } from '@/stores/template/add-device'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useShallow } from 'zustand/react/shallow'
import { addDeviceSchema, AddDeviceSchema } from './schema'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { uppercaseFirstLetter } from '@/utils'
import { AddDeviceContainer } from '../add-device-container'
import { AddDeviceAuto } from '@/components/icons/add-device-auto'
import { AddDeviceManual } from '@/components/icons/add-device-manual'
import { AddDeviceScanQR, Step } from './components/add-device-scan-qr'
import { AddDeviceForm, Mode } from './components/add-device-form'
import { AddDeviceSuccess } from './components/add-device-success'
import { useQueryClient } from '@tanstack/react-query'

interface Steps {
  label: string
  component: React.ReactNode
}

export const AddDeviceDialog = () => {
  const queryClient = useQueryClient()
  const tCommon = useTranslations('common')
  const tAddNewDevice = useTranslations('addNewDevice')
  const [step, setStep] = useState<Step>('select_mode')
  const [mode, setMode] = useState<Mode>('auto')
  const { setIsOpenDeviceModal, isOpenDeviceModal, resetDeviceModal } =
    useAddDeviceStore(
      useShallow((state) => ({
        setIsOpenDeviceModal: state.setIsOpen,
        isOpenDeviceModal: state.isOpen,
        resetDeviceModal: state.reset,
      }))
    )

  const setOpenDrawerIdentity = useIdentityStore(
    (state) => state.setOpenDrawerIdentity
  )
  const isAuth = useAuthenticated()

  const form = useForm<AddDeviceSchema>({
    resolver: zodResolver(addDeviceSchema),
  })

  const handleReset = () => {
    setStep('select_mode')
    setMode('auto')
    form.reset()
    resetDeviceModal()
  }

  const handleAddDeviceSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['devices'] })
    setStep('add_device_success')
  }

  const isAutoMode = mode === 'auto'

  const steps: Record<Step, Steps> = {
    select_mode: {
      label: `${uppercaseFirstLetter(tCommon('add'))} ${tCommon('devices')}`,
      component: (
        <>
          <AddDeviceContainer
            icon={<AddDeviceAuto />}
            title={tAddNewDevice('auto')}
            description={tAddNewDevice('auto_scan_devices_near_you')}
            handleNextStep={() => {
              setStep('scan_qr')
              setMode('auto')
            }}
            isSelected={mode === 'auto'}
            isRecommended
          />
          <AddDeviceContainer
            icon={<AddDeviceManual />}
            title={tAddNewDevice('manual')}
            description={tAddNewDevice('connect_devices_manual')}
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
      label: tAddNewDevice('scan_qr_code'),
      component: <AddDeviceScanQR setStep={setStep} />,
    },
    add_device_auto: {
      label: tAddNewDevice('device_information'),
      component: (
        <AddDeviceForm
          mode={mode}
          onSuccess={handleAddDeviceSuccess}
          onClose={handleReset}
        />
      ),
    },
    add_device_manual: {
      label: tAddNewDevice(
        isAutoMode ? 'device_information' : 'add_devices_manually'
      ),
      component: (
        <AddDeviceForm
          mode={mode}
          onSuccess={handleAddDeviceSuccess}
          onClose={handleReset}
        />
      ),
    },
    add_device_success: {
      label: '',
      component: <AddDeviceSuccess onReset={handleReset} />,
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
          setIsOpenDeviceModal(true)
        }}
      >
        <span className="text-xs font-semibold leading-4">
          {uppercaseFirstLetter(tCommon('add'))} {tCommon('devices')}{' '}
        </span>
        <Image src={'/images/plus.svg'} alt="plus" width={16} height={16} />
      </Button>
      <Dialog open={isOpenDeviceModal} onOpenChange={handleReset}>
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
