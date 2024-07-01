import React from "react"

import ImageWithBlur from "@/components/ui/image-blur"

import Warehouse from "/public/images/warehouse-tracking.svg"
import SmartOffice from "/public/images/smart-office.svg"
import IndoorTracking from "/public/images/indoor-tracking.svg"
import FleetTracking from "/public/images/fleet-tracking.svg"
import WaterManagement from "/public/images/water-management.svg"

const templates = [
  {
    href: "/warehouse-tracking",
    title: "Warehouse tracking",
    thumbnail: Warehouse,
  },
  {
    href: "/smart-office",
    title: "Smart Office",
    thumbnail: SmartOffice,
  },
  {
    href: "/indoor-tracking",
    title: "Indoor Asset Tracking",
    thumbnail: IndoorTracking,
  },
  {
    href: "/fleet-tracking",
    title: "Fleet Tracking",
    thumbnail: FleetTracking,
  },
  {
    href: "/water-management",
    title: "Water Pressure Management",
    thumbnail: WaterManagement,
  },
]

const SelectTemplate = () => {
  return (
    <div className="w-full">
      <div className="mb-6 text-center text-2xl font-medium text-brand-heading">
        You can get started with a template
      </div>
      <div className="flex justify-center flex-wrap gap-6 duration-300 mb-8">
        {templates.map((template) => (
          <Template {...template} key={template.href} />
        ))}
      </div>
    </div>
  )
}

const Template = ({ href, title, thumbnail }: (typeof templates)[number]) => {
  return (
    <div className="transition-all bg-white min-w-36 sm:w-[30%] min-h-36 p-2 rounded-lg group cursor-pointer flex-shrink hover:shadow-lg duration-300">
      <div className="flex flex-col w-full h-full gap-2">
        <div className="min-h-2/3 w-full">
          <ImageWithBlur
            src={thumbnail}
            className="w-full h-full object-cover group-hover:scale-125 duration-300"
            alt="template"
          />
        </div>
        <div className="h-1/3 text-center max-w-[80%] m-auto text-brand-text-dark font-semibold text-sm duration-200">
          {title}
        </div>
      </div>
    </div>
  )
}

export default SelectTemplate
