import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useFormContext } from 'react-hook-form'
import { AddDeviceSchema } from '../../schema'
import CircleCheckSvg from '/public/images/circle-check.svg'
import { DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AddDeviceSuccessProps {
  onReset: () => void
}

export const AddDeviceSuccess: React.FC<AddDeviceSuccessProps> = ({
  onReset,
}) => {
  const t = useTranslations('addNewDevice')

  const form = useFormContext<AddDeviceSchema>()

  const deviceName = form.getValues('name')

  return (
    <div className="w-full">
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
