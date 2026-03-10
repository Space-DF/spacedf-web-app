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
import { useEffect, useState } from 'react'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import {
  featuresToGeometries,
  parseConditions,
  transformConditions,
} from './utils'
import {
  useAddGeofence,
  type CreateGeofencePayload,
} from '../hooks/useAddGeofence'
import { toast } from 'sonner'
import { Geofence } from '@/types/geofence'
import { useUpdateGeofence } from '../hooks/useUpdateGeofence'

interface UpsertGeofenceProps {
  isOpen: boolean
  onClose: () => void
  geofence?: Geofence
  mutate: () => void
}

const INFO_GEOFENCE_FIELDS: (keyof GeofenceForm)[] = [
  'type_zone',
  'color',
  'name',
]
const CONDITION_GEOFENCE_FIELDS: (keyof GeofenceForm)[] = ['conditions']

const mapInstance = MapInstance.getInstance()

const DEFAULT_GEOFENCE_FORM: GeofenceForm = {
  type_zone: 'safe',
  color: 'default',
  name: '',
  conditions: [],
}

const UpsertGeofence = ({
  isOpen,
  onClose,
  geofence,
  mutate,
}: UpsertGeofenceProps) => {
  const t = useTranslations('common')
  const tGeofence = useTranslations('geofence')
  const resetGeofenceStore = useGeofenceStore((state) => state.reset)

  const form = useForm<GeofenceForm>({
    resolver: zodResolver(addGeofenceSchema),
    defaultValues: DEFAULT_GEOFENCE_FORM,
  })

  const [currentTab, setCurrentTab] = useState<'info' | 'condition'>('info')

  const { trigger: addGeofence, isMutating: isAddingGeofence } =
    useAddGeofence()
  const { trigger: updateGeofence, isMutating: isUpdatingGeofence } =
    useUpdateGeofence(geofence?.id)
  const draw = mapInstance.getTerraDraw()
  const handleClose = () => {
    if (!draw) return
    const geoFencesIds = useGeofenceStore.getState().geoFencesIds
    if (!!geoFencesIds.length) {
      draw.removeFeatures(geoFencesIds)
    }
    resetGeofenceStore()
    form.reset(DEFAULT_GEOFENCE_FORM)
    onClose()
    draw.setMode('render')
    setCurrentTab('info')
    mapInstance.setDrawingMode(false)
  }

  useEffect(() => {
    if (!draw) return
    if (!isOpen) {
      const geoFencesIds = useGeofenceStore.getState().geoFencesIds
      if (!!geoFencesIds.length) {
        draw.removeFeatures(geoFencesIds)
      }
      resetGeofenceStore()
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!draw) return
    const features = draw?.getSnapshot()
    if (!features) return toast.error(tGeofence('please_draw_a_geofence'))
    const isValid = await form.trigger()
    const data = form.getValues()
    if (!isValid) {
      const errors = form.formState.errors
      if (INFO_GEOFENCE_FIELDS.some((field) => errors[field])) {
        setCurrentTab('info')
        return
      }
      if (CONDITION_GEOFENCE_FIELDS.some((field) => errors[field])) {
        setCurrentTab('condition')
        return
      }
    }
    const geometry = featuresToGeometries(features)
    if (!geometry.length)
      return toast.error(tGeofence('please_draw_a_geofence'))
    const payload: CreateGeofencePayload = {
      features: geometry,
      name: data.name,
      color: data.color ?? 'default',
      type_zone: data.type_zone,
      definition: transformConditions(data.conditions),
    }
    if (geofence) {
      await updateGeofence({ id: geofence.id, ...payload })
    } else {
      await addGeofence(payload)
    }
    mutate()
    handleClose()
  }

  useEffect(() => {
    if (geofence && isOpen) {
      form.reset({
        ...geofence,
        conditions: parseConditions(geofence.event_rule.definition.conditions),
      })
    }
  }, [geofence, isOpen])

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
            <div>
              {geofence ? tGeofence('edit_geofence') : t('add_geofence')}
            </div>
          </div>
        }
        externalButton={
          <Button
            onClick={handleSave}
            loading={isAddingGeofence || isUpdatingGeofence}
          >
            {t('save')}
          </Button>
        }
      >
        <FormProvider {...form}>
          <Form {...form}>
            <TabLineHeader
              tabs={[
                { value: 'info', label: 'Info' },
                { value: 'condition', label: 'Condition' },
              ]}
              currentTab={currentTab}
              onTabChange={(tab) => setCurrentTab(tab as 'info' | 'condition')}
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

export default UpsertGeofence
