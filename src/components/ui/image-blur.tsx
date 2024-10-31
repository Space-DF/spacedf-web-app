/* eslint-disable jsx-a11y/alt-text */
'use client'

import { cn } from '@/lib/utils'
import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

export default function ImageWithBlur({
  className,
  ...imageProps
}: ImageProps & {
  addParentClass?: string
}) {
  const [isLoading, setLoading] = useState(true)

  return (
    <div className="group h-full w-full overflow-hidden bg-transparent">
      <Image
        className={cn(
          'h-full w-full duration-300 ease-in-out',
          isLoading
            ? 'scale-110 blur-2xl grayscale'
            : 'scale-100 blur-0 grayscale-0',
          className,
        )}
        onLoad={() => setLoading(false)}
        {...imageProps}
      />
    </div>
  )
}
