import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { SliderPayload } from '@/validator'
import { useFormContext } from 'react-hook-form'

const SliderPreview = () => {
  const form = useFormContext<SliderPayload>()
  const [max, min, step] = form.watch([
    'source.max',
    'source.min',
    'source.step',
  ])
  return (
    <>
      <Slider
        defaultValue={[50]}
        max={max}
        min={min}
        step={step}
        onValueChange={(value) => form.setValue('value', value[0])}
        thumbChildren={
          <Badge className="scale-0 group-hover:scale-100 transition-transform absolute left-1/2 -translate-x-1/2 -translate-y-1/2 -top-4">
            {form.watch('value')}
          </Badge>
        }
      />
      <div className="flex justify-between w-full text-xs">
        <p>{min}</p>
        <p>{max}</p>
      </div>
    </>
  )
}

export default SliderPreview
