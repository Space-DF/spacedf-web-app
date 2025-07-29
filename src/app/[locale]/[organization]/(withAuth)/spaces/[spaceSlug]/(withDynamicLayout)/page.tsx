import { DigitalTwinsContainer } from '@/app/[locale]/[organization]/(withDynamicLayout)/digital-twins/containers'
import { SelectMapType } from '@/components/ui/select-map-type'

export default function SpaceDetail() {
  return (
    <div>
      <DigitalTwinsContainer />
      <SelectMapType />
    </div>
  )
}
