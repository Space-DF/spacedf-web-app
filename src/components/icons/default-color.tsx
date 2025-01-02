import { SVGProps } from '@/types/global'
import React from 'react'

const DefaultColor = (props: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <g clip-path="url(#clip0_7857_178201)">
        <path
          d="M6 0.5H18C21.0376 0.5 23.5 2.96243 23.5 6V18C23.5 21.0376 21.0376 23.5 18 23.5H6C2.96243 23.5 0.5 21.0376 0.5 18V6C0.5 2.96243 2.96243 0.5 6 0.5Z"
          fill="white"
        />
        <path d="M21.5 2.5L2.5 21.5" stroke="#D73E3D" />
      </g>
      <defs>
        <clipPath id="clip0_7857_178201">
          <path
            d="M0 6C0 2.68629 2.68629 0 6 0H18C21.3137 0 24 2.68629 24 6V18C24 21.3137 21.3137 24 18 24H6C2.68629 24 0 21.3137 0 18V6Z"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default DefaultColor
