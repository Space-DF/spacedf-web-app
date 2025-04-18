'use client'

import { cn } from '@/lib/utils'
import Image, { ImageProps } from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ImageWithBlur({
  className,
  redirect,
  isPending = false,
  ...imageProps
}: ImageProps & {
  addParentClass?: string
  redirect?: string
  isPending?: boolean
}) {
  const [isLoading, setLoading] = useState(true)
  const router = useRouter()

  const handleRedirect = () => {
    if (redirect) {
      router.push(`${redirect}`)
    }
  }

  return (
    <div
      className="group h-full w-full overflow-hidden bg-transparent"
      onClick={handleRedirect}
    >
      <Image
        className={cn(
          'h-full w-full duration-300 ease-in-out',
          isLoading || isPending
            ? 'scale-110 blur-2xl grayscale'
            : 'scale-100 blur-0 grayscale-0',
          className
        )}
        onLoad={() => setLoading(false)}
        {...imageProps}
        alt="123"
      />
    </div>
  )
}
