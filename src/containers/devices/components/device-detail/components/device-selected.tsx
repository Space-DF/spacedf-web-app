import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useTranslations } from 'next-intl'
import { Pencil, Trash2 } from 'lucide-react'
import { useDeviceStore } from '@/stores/device-store'
import { useShallow } from 'zustand/react/shallow'
import { useDeviceHistory } from '@/hooks/useDeviceHistory'

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

const DeviceSelected = () => {
  const t = useTranslations('addNewDevice')
  const { deviceSelected } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
    }))
  )

  const { startDrawHistory } = useDeviceHistory()
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
          <InformationItem label={`${t('device_id')}:`} content={'1'} />
          <InformationItem
            label={`${t('device_name')}:`}
            content={'Device 1'}
          />
          <InformationItem
            label={`${t('deveui')}:`}
            content={'Mild Steel Cement Lined'}
          />
          <InformationItem label={`${t('description')}:`} content={'150'} />
        </div>
      </div>
      <Button onClick={() => startDrawHistory(deviceSelected)}>
        {t('device_history')}
      </Button>
    </div>
  )
}

export default DeviceSelected
