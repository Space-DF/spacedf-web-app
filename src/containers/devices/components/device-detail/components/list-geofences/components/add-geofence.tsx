import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Slide } from '@/components/ui/slide'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ChevronDown, Circle, Square } from 'lucide-react'
import { addGeofenceSchema } from '../validator'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AddGeofenceProps {
  isOpen: boolean
  onClose: () => void
}

type GeofenceForm = z.infer<typeof addGeofenceSchema>

type GeofenceShape = 'circle' | 'square' | 'custom'

const geofenceShape: {
  label: GeofenceShape
  value: GeofenceShape
  icon: React.ReactNode
}[] = [
  {
    label: 'circle',
    value: 'circle',
    icon: <Circle size={20} className="text-brand-component-stroke-gray" />,
  },
  {
    label: 'square',
    value: 'square',
    icon: <Square size={20} className="text-brand-component-stroke-gray" />,
  },
  {
    label: 'custom',
    value: 'custom',
    icon: (
      <Image src="/images/pen-nib.svg" alt="custom" width={20} height={20} />
    ),
  },
]

const AddGeofence = ({ isOpen, onClose }: AddGeofenceProps) => {
  const form = useForm<GeofenceForm>({
    resolver: zodResolver(addGeofenceSchema),
    defaultValues: {
      shape: 'circle',
      unit: 'km',
    },
  })

  const onSubmit = (data: GeofenceForm) => {
    console.log(data)
  }

  const t = useTranslations('common')
  return (
    <Slide
      className="w-full bg-brand-fill-surface dark:bg-brand-fill-outermost p-0"
      open={isOpen}
      showCloseButton={false}
      direction="right"
      size="100%"
      contentClassName="p-0"
      onClose={onClose}
    >
      <RightSideBarLayout
        onClose={onClose}
        className="h-full relative"
        title={
          <div className="flex size-full items-center gap-2">
            <ArrowLeft size={20} className="cursor-pointer" onClick={onClose} />
            <div>{t('timeline')}</div>
          </div>
        }
        externalButton={<Button>{t('save')}</Button>}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-6"
          >
            <FormField
              control={form.control}
              name="shape"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('geofence_shape')}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {geofenceShape.map((shape) => (
                        <Tooltip key={shape.value}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'p-3 rounded-lg duration-150 size-[44px]',
                                field.value === shape.value &&
                                  'border-brand-component-stroke-dark dark:border-brand-stroke-dark-soft border-[2px]'
                              )}
                              type="button"
                              onClick={() => field.onChange(shape.value)}
                            >
                              {shape.icon}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t(shape.label)}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('geofence_name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('geofence_name')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tag')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('tag')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('latitude')} (X)</FormLabel>
                  <FormControl>
                    <Input placeholder={t('latitude')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('longitude')} (Y)</FormLabel>
                  <FormControl>
                    <Input placeholder={t('longitude')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>{t('radius')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('radius')} {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem className="absolute right-1 top-[23px]">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || 'km'}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="border-none shadow-none bg-brand-fill-dark-soft border-brand-stroke-dark-soft border border-l-0 p-0 focus:outline-none focus:ring-0 outline-none ring-0 h-7 dark:bg-brand-heading "
                              icon={
                                <ChevronDown className="w-3 text-brand-icon-gray" />
                              }
                            >
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="km">km</SelectItem>
                            <SelectItem value="mi">mi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </RightSideBarLayout>
    </Slide>
  )
}

export default AddGeofence
