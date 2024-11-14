import React from 'react'
import ImageWithBlur from './image-blur'
import NodataSVG from '/public/images/nodata.svg'

type NodataProps = {
  iconHeight?: number
  iconWidth?: number
  content?: string
}

export const Nodata = ({
  iconHeight = 120,
  iconWidth = 120,
  content,
}: NodataProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div
        style={{
          width: iconWidth,
          height: iconHeight,
        }}
      >
        <ImageWithBlur src={NodataSVG} alt="nodata" className="h-full w-full" />
      </div>
      <p className="text-brand-component-text-dark mt-3 text-wrap text-center text-base font-normal">
        {content || 'No Data yet'}
      </p>
    </div>
  )
}
