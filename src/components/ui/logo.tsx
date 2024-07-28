import Image from "next/image"
import React from "react"
import LogoSVG from "/public/space_df_logo.svg"
import LogoBlur from "/public/space_df_logo_blur.svg"
import ImageWithBlur from "./image-blur"
import { cn } from "@/lib/utils"

export const Logo = ({
  allowAnimation = true,
}: {
  allowAnimation?: boolean
}) => {
  return (
    <div
      className={cn(
        "w-full h-full relative flex items-center justify-center",
        allowAnimation && " animate-bounce-slow"
      )}
    >
      <div className="w-[80%] h-[80%] flex items-center justify-center absolute z-0">
        <ImageWithBlur
          src={LogoSVG}
          alt="space_df_logo"
          className="w-full h-full blur-sm duration-1000"
        />
      </div>
      <div className="bg-[url('/space_df_logo_blur.svg')] bg-no-repeat bg-cover bg-center w-full h-full absolute z-10">
        <ImageWithBlur
          src={LogoBlur}
          alt="space_df_logo"
          className="w-full h-full blur-sm duration-700"
        />
      </div>
    </div>
  )
}
