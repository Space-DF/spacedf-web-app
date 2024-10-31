import Image from 'next/image'
import React from 'react'
import LogoSVG from '/public/space_df_logo.svg'
import { Logo } from './logo'

const LoadingFullScreen = () => {
  return (
    <div className="pointer-events-none flex h-full w-full flex-col items-center justify-center">
      <div className="h-48 w-48">
        <Logo />
      </div>
    </div>
  )
}

export default LoadingFullScreen
