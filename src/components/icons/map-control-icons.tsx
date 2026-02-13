import { SVGProps } from '@/types/global'

const GeoLocateControl = (props: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M20.891 2.006l.106 -.006l.13 .008l.09 .016l.123 .035l.107 .046l.1 .057l.09 .067l.082 .075l.052 .059l.082 .116l.052 .096c.047 .1 .077 .206 .09 .316l.005 .106c0 .075 -.008 .149 -.024 .22l-.035 .123l-6.532 18.077a1.55 1.55 0 0 1 -1.409 .903a1.547 1.547 0 0 1 -1.329 -.747l-.065 -.127l-3.352 -6.702l-6.67 -3.336a1.55 1.55 0 0 1 -.898 -1.259l-.006 -.149c0 -.56 .301 -1.072 .841 -1.37l.14 -.07l18.017 -6.506l.106 -.03l.108 -.018z" />
    </svg>
  )
}

const ZoomOutIcon = (props: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 12l14 0" />
    </svg>
  )
}

const ZoomInIcon = (props: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </svg>
  )
}

const CompassIcon = (props: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 14.66a1 1 0 1 0 0 2a1 1 0 0 0 0 -2zm3.684 -10.949l-6 2a1 1 0 0 0 -.633 .633l-2.007 6.026l-.023 .086l-.017 .113l-.004 .068v.044l.009 .111l.012 .07l.04 .144l.045 .1l.054 .095l.064 .09l.069 .075l.084 .074l.098 .07l.1 .054l.078 .033l.105 .033l.109 .02l.043 .005l.068 .004h.044l.111 -.009l.07 -.012l.02 -.006l.019 -.002l.074 -.022l6 -2a1 1 0 0 0 .633 -.633l2 -6a1 1 0 0 0 -1.265 -1.265zm-1.265 2.529l-1.21 3.629l-3.629 1.21l1.21 -3.629l3.629 -1.21zm-9.419 1.42a1 1 0 1 0 0 2a1 1 0 0 0 0 -2zm14 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2zm-7 -7a1 1 0 1 0 0 2a1 1 0 0 0 0 -2z" />
    </svg>
  )
}

const LocationOffIcon = (props: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12.896 19.792l-2.896 -5.792l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5l-3.487 9.657" />
      <path d="M21.5 21.5l-5 -5" />
      <path d="M16.5 21.5l5 -5" />
    </svg>
  )
}

export {
  GeoLocateControl,
  ZoomOutIcon,
  ZoomInIcon,
  CompassIcon,
  LocationOffIcon,
}
