import React from 'react'
import { mapSource } from '@/validator'
interface TablePreviewProps {
  source: mapSource
}

const MapPreview: React.FC<TablePreviewProps> = ({ source }) => {
  const { coordinate, map_type } = source

  return (
    <div className="w-full aspect-[3/2]">
      <iframe
        className="size-full rounded"
        src={`https://www.google.com/maps?q=${coordinate[0]},${coordinate[1]}&z=15&t=${map_type}&output=embed`}
        loading="lazy"
      />
    </div>
  )
}
export default MapPreview
