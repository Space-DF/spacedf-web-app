import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import ColorSelect from '@/containers/dashboard/components/widget-selected/components/color-select'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addGeofenceSchema } from '../../schema'
import { z } from 'zod'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { useEffect } from 'react'
import {
  DEFAULT_GEOFENCE_COLOR,
  useGeofenceStore,
} from '@/stores/geofence-store'

const GEOFENCE_DRAWING_MODES = [
  'rectangle',
  'circle',
  'polygon',
  'sector',
  'freehand',
  'angled-rectangle',
  'sensor',
] as const

type GeofenceForm = z.infer<typeof addGeofenceSchema>
const mapInstance = MapInstance.getInstance()

const toHexColor = (color?: string) =>
  color === 'default' || !color
    ? DEFAULT_GEOFENCE_COLOR
    : color.startsWith('#')
      ? color
      : `#${color}`

const GeofenceInfo = () => {
  const setCurrentDrawingColor = useGeofenceStore(
    (state) => state.setCurrentDrawingColor
  )
  const form = useForm<GeofenceForm>({
    resolver: zodResolver(addGeofenceSchema),
    defaultValues: {
      type: 'safe',
    },
  })
  const t = useTranslations('common')

  const onSubmit = (data: GeofenceForm) => {
    console.log(data)
  }

  const handleChangeColor = (color: string) => {
    const draw = mapInstance.getTerraDraw()
    if (!draw) return
    const hexColor = toHexColor(color)
    setCurrentDrawingColor(hexColor)
    const features = draw.getSnapshot()
    form.setValue('color', color)
    if (!features.length) return
    features.forEach((feature) => {
      const id = feature.id
      if (id != null && draw.hasFeature(id)) {
        draw.updateFeatureProperties(id, { color: hexColor })
      }
    })
    GEOFENCE_DRAWING_MODES.forEach((mode) => {
      draw.updateModeOptions(mode, {
        styles: {
          fillColor: (f: { properties?: { color?: string } }) =>
            (f.properties?.color as `#${string}`) || hexColor,
          outlineColor: (f: { properties?: { color?: string } }) =>
            (f.properties?.color as `#${string}`) || hexColor,
        },
      })
    })
  }

  useEffect(() => {
    const hexColor = toHexColor(form.getValues('color'))
    setCurrentDrawingColor(hexColor)
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('type')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-x-4"
                >
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="safe" />
                    </FormControl>
                    <FormLabel className="font-medium text-sm text-brand-component-text-dark">
                      Safe zone
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="danger" />
                    </FormControl>
                    <FormLabel className="font-medium text-sm text-brand-component-text-dark">
                      Danger zone
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('color')}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={handleChangeColor}
                  defaultValue={field.value}
                >
                  <ColorSelect fieldValue={field.value} />
                </Select>
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
              <FormLabel>{t('geofence_name')}</FormLabel>
              <FormControl>
                <Input
                  className="border-none"
                  placeholder={t('geofence_name')}
                  {...field}
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export default GeofenceInfo
