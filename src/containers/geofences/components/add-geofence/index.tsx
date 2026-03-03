import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Slide } from '@/components/ui/slide'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import TabLineHeader from '@/components/common/tab-line-header'
import { TabsContent } from '@/components/ui/tabs'
import GeofenceInfo from './components/info'
import { useGeofenceStore } from '@/stores/geofence-store'
import GeofenceCondition from './components/condition'
import { addGeofenceSchema, GeofenceForm } from './schema'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { useEffect } from 'react'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'

interface AddGeofenceProps {
  isOpen: boolean
  onClose: () => void
}

const mapInstance = MapInstance.getInstance()

const AddGeofence = ({ isOpen, onClose }: AddGeofenceProps) => {
  const t = useTranslations('common')
  const resetGeofenceStore = useGeofenceStore((state) => state.reset)

  const form = useForm<GeofenceForm>({
    resolver: zodResolver(addGeofenceSchema),
    defaultValues: {
      type: 'safe',
      color: 'default',
      name: '',
    },
  })

  const handleClose = () => {
    resetGeofenceStore()
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      resetGeofenceStore()
    }
  }, [isOpen])

  const handleSave = async () => {
    const isValid = await form.trigger()
    const data = form.getValues()
    if (!isValid) return

    const draw = mapInstance.getTerraDraw()
    if (!draw) return
    const features = draw?.getSnapshot()
    console.log({ features, ...data })
  }

  return (
    <Slide
      className="w-full bg-brand-fill-surface dark:bg-brand-fill-outermost p-0"
      open={isOpen}
      showCloseButton={false}
      direction="right"
      size="100%"
      contentClassName="p-0"
      onClose={handleClose}
    >
      <RightSideBarLayout
        onClose={handleClose}
        className="h-full relative"
        contentClassName="px-0"
        title={
          <div className="flex size-full items-center gap-2">
            <ArrowLeft
              size={20}
              className="cursor-pointer"
              onClick={handleClose}
            />
            <div>{t('add_geofence')}</div>
          </div>
        }
        externalButton={<Button onClick={handleSave}>{t('save')}</Button>}
      >
        <FormProvider {...form}>
          <Form {...form}>
            <TabLineHeader
              tabs={[
                { value: 'info', label: 'Info' },
                { value: 'condition', label: 'Condition' },
              ]}
              tabContents={
                <>
                  <TabsContent
                    value="info"
                    className="mt-4 flex-1 overflow-y-scroll px-4"
                  >
                    <GeofenceInfo />
                  </TabsContent>
                  <TabsContent
                    value="condition"
                    className="mt-4 flex-1 overflow-y-scroll px-4"
                  >
                    <GeofenceCondition />
                  </TabsContent>
                </>
              }
            />
          </Form>
        </FormProvider>
      </RightSideBarLayout>
    </Slide>
  )
}

export default AddGeofence
