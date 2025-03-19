import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import React, { useCallback, useMemo, useState } from 'react'
import SelectMode from './components/select-mode'
import ScanQR from './components/scan-qr'
import { ArrowLeft } from 'lucide-react'
import AddDeviceLoading from './components/loading'
import AddDeviceManual from './components/add-device-manual'
import AddDeviceAuto from './components/add-device-auto'
import { AddDeviceMode, Step, Steps } from './types'
import AddEUI from './components/add-eui'
import { FormProvider, useForm } from 'react-hook-form'
import { EUIDevice, EUISchema } from './validator'
import { zodResolver } from '@hookform/resolvers/zod'
import AddDeviceSuccessModal from './components/add-device-success'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  children: React.ReactNode
  onAddDevice: (device: EUIDevice['eui']) => void
  isLoading?: boolean
}

const stepAuto = [
  Step.SelectMode,
  Step.ScanQR,
  Step.Loading,
  Step.AddDeviceAuto,
  Step.Loading,
  Step.AddEUI,
]
const stepManual = [Step.SelectMode, Step.AddDeviceManual, Step.AddEUI]

const AddDeviceModal: React.FC<Props> = ({
  children,
  onAddDevice,
  isLoading,
}) => {
  const t = useTranslations('organization')
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>(Step.SelectMode)
  const [selectedMode, setSelectedMode] = useState<AddDeviceMode>(
    AddDeviceMode.Manual
  )
  const [stepIndex, setStepIndex] = useState(0)
  const [file, setFile] = useState<File>()
  const [selectedProtocol, setSelectedProtocol] = useState<number>()
  const [selectedBrand, setSelectedBrand] = useState<number>()

  const onSelectType = useCallback((newMode: AddDeviceMode) => {
    setSelectedMode(newMode)
  }, [])

  const selectedStep = useMemo(() => {
    return selectedMode === AddDeviceMode.Auto ? stepAuto : stepManual
  }, [selectedMode])

  const isShowBackIcon =
    step !== Step.SelectMode && step !== Step.AddDeviceSuccess

  const form = useForm<EUIDevice>({
    resolver: zodResolver(EUISchema),
    mode: 'onChange',
  })

  const {
    formState: { isValid },
    watch,
  } = form

  const deviceEUIs = watch('eui')

  const onNextStep = useCallback(async () => {
    const currentStepIndex = selectedStep.findIndex(
      (s, index) => s === step && index === stepIndex
    )
    if (currentStepIndex === -1) return
    if (currentStepIndex === selectedStep.length - 1) {
      setStep(Step.AddDeviceSuccess)
      setStepIndex(0)
      await onAddDevice(deviceEUIs)
      return
    }
    setStepIndex(currentStepIndex + 1)
    setStep(selectedStep[currentStepIndex + 1])
  }, [selectedStep, step, stepIndex, deviceEUIs])

  const handleReset = () => {
    setOpen(false)
    setFile(undefined)
    setSelectedBrand(undefined)
    setSelectedProtocol(undefined)
    setStep(Step.SelectMode)
    setStepIndex(0)
    form.reset({
      eui: [
        {
          status: 'active',
          id: uuidv4(),
        },
      ],
    })
  }

  const handleBackStep = () => {
    const currentStepIndex = selectedStep.findIndex(
      (s, index) => s === step && index === stepIndex
    )
    if (currentStepIndex <= 0) {
      return handleReset()
    }
    if (selectedStep[currentStepIndex - 1] === Step.Loading) {
      const newIndex = currentStepIndex - 2
      setStep(selectedStep[newIndex])
      setStepIndex(newIndex)
      return
    }
    const newIndex = currentStepIndex - 1
    setStepIndex(newIndex)
    setStep(selectedStep[newIndex])
  }

  const steps: Record<Step, Steps> = useMemo(
    () => ({
      select_mode: {
        label: t('add_device'),
        description: t('choose_brand'),
        component: (
          <SelectMode value={selectedMode} onSelectType={onSelectType} />
        ),
      },
      scan_qr: {
        label: t('auto_detect'),
        description: t('scan_description'),
        component: <ScanQR file={file} setFile={setFile} />,
      },
      loading: {
        label: t('add_device'),
        component: <AddDeviceLoading onNextStep={onNextStep} />,
      },
      add_device_auto: {
        label: t('your_device'),
        description: t('select_device_brand_type_proceed'),
        component: <AddDeviceAuto />,
      },
      add_device_manual: {
        label: t('your_device'),
        description: t('select_device_brand_type_proceed'),
        component: (
          <AddDeviceManual
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
          />
        ),
      },
      add_eui: {
        label: t('add_eui'),
        description: t('provide_lorawan_along_with_corresponding_name'),
        component: <AddEUI />,
      },
      add_device_success: {
        label: t('add_lorawan_device'),
        component: <AddDeviceSuccessModal />,
      },
    }),
    [
      t,
      selectedMode,
      onSelectType,
      onNextStep,
      file,
      selectedProtocol,
      selectedBrand,
    ]
  )

  const isDisabled =
    (!file && step === Step.ScanQR) ||
    (step === Step.AddEUI && (!isValid || !deviceEUIs.length)) ||
    (step === Step.AddDeviceManual && !selectedBrand)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="text-sm p-6 min-w-[600px] max-w-[1200px] w-fit"
        onInteractOutside={(e) => {
          if (step !== Step.SelectMode) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader className="border-none p-0 space-y-4">
          <DialogTitle className="flex items-center gap-2.5">
            {isShowBackIcon && (
              <ArrowLeft
                className="cursor-pointer"
                size={20}
                onClick={handleBackStep}
              />
            )}{' '}
            {steps[step].label}
          </DialogTitle>
          {steps[step].description && (
            <DialogDescription className="text-xs">
              {steps[step].description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="my-6">
          <FormProvider {...form}>{steps[step].component}</FormProvider>
        </div>
        {step !== Step.Loading && step !== Step.AddDeviceSuccess && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="text-brand-component-text-gray"
              onClick={handleBackStep}
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={isDisabled}
              onClick={onNextStep}
              loading={isLoading}
            >
              {t('next')}
            </Button>
          </DialogFooter>
        )}
        {step === Step.AddDeviceSuccess && (
          <DialogFooter className="w-full">
            <Button type="button" className="w-full" onClick={handleReset}>
              {t('done')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AddDeviceModal
