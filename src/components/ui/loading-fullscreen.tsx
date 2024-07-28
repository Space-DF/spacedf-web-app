import Image from "next/image"
import React from "react"
import LogoSVG from "/public/space_df_logo.svg"
import { Logo } from "./logo"

const LoadingFullScreen = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col pointer-events-none">
      <div className="w-48 h-48">
        <Logo />
      </div>
    </div>
  )
}

export default LoadingFullScreen
