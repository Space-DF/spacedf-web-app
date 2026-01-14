import React from 'react'
import { mapSource, MapType } from '@/validator'
import { useTheme } from 'next-themes'
interface TablePreviewProps {
  source: mapSource
}

const MapPreview: React.FC<TablePreviewProps> = ({ source }) => {
  const { coordinate, map_type } = source || {
    coordinate: [16.05204105833857, 108.2168072245793],
    map_type: MapType.RoadMap,
  }

  const { theme } = useTheme()

  const isDarkMode = theme === 'dark'

  return (
    <div className="w-full aspect-[3/2]">
      <iframe
        className="size-full rounded"
        src={`https://www.google.com/maps?q=${coordinate[0]},${coordinate[1]}&z=15&t=${map_type}&output=embed`}
        loading="lazy"
        style={{
          filter: isDarkMode ? 'invert(90%) hue-rotate(180deg)' : 'none',
        }}
      />
    </div>
  )
}
export default MapPreview
