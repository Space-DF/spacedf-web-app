import { useTranslations } from 'next-intl'
import { Dispatch, SetStateAction } from 'react'
import { AddDeviceSchema } from '../../schema'
import { useFormContext } from 'react-hook-form'
import { useCheckClaimCode } from '@/containers/devices/hooks/useCheckClaimCode'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { formatValueEUI } from '@/containers/devices/utils'
import { LoaderCircle } from 'lucide-react'
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner'

const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((m) => m.Scanner),
  { ssr: false }
)

export type Step =
  | 'select_mode'
  | 'scan_qr'
  | 'add_device_auto'
  | 'add_device_manual'
  | 'add_device_success'

interface AddDeviceScanQRProps {
  setStep: Dispatch<SetStateAction<Step>>
}

export const AddDeviceScanQR: React.FC<AddDeviceScanQRProps> = ({
  setStep,
}) => {
  const { trigger: checkClaimCode, isMutating } = useCheckClaimCode()
  const t = useTranslations('addNewDevice')

  const form = useFormContext<AddDeviceSchema>()

  const handleScan = async (result: IDetectedBarcode[]) => {
    const response = await checkClaimCode(result[0].rawValue, {
      onError: (error) => {
        toast.error(error.message || t('failed_to_scan_qr_code'))
      },
    })
    form.setValue(
      'dev_eui',
      formatValueEUI(response.lorawan_device?.dev_eui || '').toUpperCase()
    )
    setStep('add_device_auto')
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
