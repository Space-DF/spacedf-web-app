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
  hasEmptyWeekdays,
  parseConditions,
  transformConditions,
} from './utils'
import {
  useAddGeofence,
  type CreateGeofencePayload,
} from '../hooks/useAddGeofence'
import { toast } from 'sonner'
import { FeatureId } from '@/types/geofence'
import { useUpdateGeofence } from '../hooks/useUpdateGeofence'
import { useShallow } from 'zustand/react/shallow'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { useGeofenceMapStore } from '@/stores/geofence-map-store'

interface UpsertGeofenceProps {
  isOpen: boolean
  onClose: () => void
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

const UpsertGeofence = ({ isOpen, onClose, mutate }: UpsertGeofenceProps) => {
  const t = useTranslations('common')
  const tGeofence = useTranslations('geofence')
  const {
    reset: resetGeofenceStore,
    setOriginalGeoFencesIds,
    draftGeoFencesIds,
    setDraftGeoFencesIds,
    geoFencesIds,
  } = useGeofenceStore(
    useShallow((state) => ({
      reset: state.reset,
      setOriginalGeoFencesIds: state.setOriginalGeoFencesIds,
      draftGeoFencesIds: state.draftGeoFencesIds,
      setDraftGeoFencesIds: state.setDraftGeoFencesIds,
      geoFencesIds: state.geoFencesIds,
    }))
  )

  const queryClient = useQueryClient()

  const form = useForm<GeofenceForm>({
    resolver: zodResolver(addGeofenceSchema),
    defaultValues: DEFAULT_GEOFENCE_FORM,
  })

  const {
    clearDirtyFeatureIds,
    selectedGeofence: geofence,
    setSelectedGeofence,
    setSelectedFeature,
    selectedFeature,
  } = useGeofenceMapStore(
    useShallow((state) => ({
      clearDirtyFeatureIds: state.clearDirtyFeatureIds,
      selectedGeofence: state.selectedGeofence,
      setSelectedGeofence: state.setSelectedGeofence,
      setSelectedFeature: state.setSelectedFeature,
      selectedFeature: state.selectedFeature,
    }))
  )
  const [currentTab, setCurrentTab] = useState<'info' | 'condition'>('info')

  const { trigger: addGeofence, isMutating: isAddingGeofence } =
    useAddGeofence()
  const { trigger: updateGeofence, isMutating: isUpdatingGeofence } =
    useUpdateGeofence(geofence?.id)

  const draw = mapInstance.getTerraDraw()

  const handleClose = () => {
    if (!draw) return
    clearDirtyFeatureIds()
    if (!!geoFencesIds.length) {
      draw.removeFeatures(draftGeoFencesIds)
      setOriginalGeoFencesIds([])
      setDraftGeoFencesIds([])
    }
    resetGeofenceStore()
    form.reset(DEFAULT_GEOFENCE_FORM)
    onClose()
    draw.setMode('render')
    setCurrentTab('info')
    mapInstance.setDrawingMode(false)
    const features = draw.getSnapshot()
    features.forEach((f) => {
      draw.updateFeatureProperties(f.id as FeatureId, {
        disabled: false,
      })
    })
    if (selectedFeature) {
      draw.deselectFeature(selectedFeature)
    }
    setSelectedGeofence(undefined)
    setSelectedFeature(undefined)
  }

  const handleSave = async () => {
    if (!draw) return
    const features = draw?.getSnapshot()
    if (!geoFencesIds.length)
      return toast.error(tGeofence('please_draw_a_geofence'))
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

    if (data.conditions.some(hasEmptyWeekdays)) {
      setCurrentTab('condition')
      return toast.error(tGeofence('please_select_weekdays'))
    }

    const featuresWithId = features
      .filter((f) => geoFencesIds.includes(f.id as string))
      .map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          id: f.id as string,
        },
      }))
    const geometry = featuresToGeometries(featuresWithId)
    if (!geometry.length)
      return toast.error(tGeofence('please_draw_a_geofence'))
    const payload: CreateGeofencePayload = {
      features: geometry,
      name: data.name,
      color: data.color ?? 'default',
      type_zone: data.type_zone,
      definition: transformConditions(data.conditions, data.type_zone),
    }
    if (geofence) {
      await updateGeofence({ id: geofence.id, ...payload })
    } else {
      await addGeofence(payload)
    }
    setDraftGeoFencesIds([])
    setOriginalGeoFencesIds([])
    queryClient.invalidateQueries({ queryKey: queryKeys.geofences.all })
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
      className="w-full bg-background p-0"
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
                  <TabsContent value="info" className="mt-4 flex-1 px-4">
                    <GeofenceInfo />
                  </TabsContent>
                  <TabsContent value="condition" className="mt-4 flex-1 px-4">
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
