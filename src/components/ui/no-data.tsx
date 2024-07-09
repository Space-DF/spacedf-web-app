import React from "react"
import ImageWithBlur from "./image-blur"
import NodataSVG from "/public/images/nodata.svg"

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
    <div className="flex items-center justify-center p-4 flex-col gap-3">
      <div
        style={{
          width: iconWidth,
          height: iconHeight,
        }}
      >
        <ImageWithBlur src={NodataSVG} alt="nodata" className="w-full h-full" />
      </div>
      <p className="mt-3 text-wrap text-base font-normal text-brand-text-dark text-center dark:text-brand-dark-text-gray">
        {content || "No Data yet"}
      </p>
    </div>
  )
}
