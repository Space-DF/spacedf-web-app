import Image from "next/image"
import React from "react"
import LogoSVG from "/public/space_df_logo.svg"

const LoadingFullScreen = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col">
      <Image
        src={LogoSVG}
        width={186}
        height={186}
        alt="space_df_logo"
        className="animate-bounce-slow"
      />
    </div>
  )
}

export default LoadingFullScreen
