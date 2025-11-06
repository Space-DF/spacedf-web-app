import { useTheme } from 'next-themes'

export const SwitchWidgetIcon = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const lineColor = isDark ? '#1B2037' : '#D9D9D9'

  const backgroundColor = isDark ? '#1B2037' : '#171A28'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="77"
      height="72"
      viewBox="0 0 77 40"
      fill="none"
    >
      <g filter="url(#filter0_i_13161_30384)">
        <path
          d="M0 10C0 5.58172 3.58172 2 8 2H67C71.4183 2 75 5.58172 75 10V30C75 34.4183 71.4183 38 67 38H8C3.58172 38 0 34.4183 0 30V10Z"
          fill={backgroundColor}
        />
        <g filter="url(#filter1_d_13161_30384)">
          <path
            d="M39 10C39 6.68629 41.6863 4 45 4H67C70.3137 4 73 6.68629 73 10V30C73 33.3137 70.3137 36 67 36H45C41.6863 36 39 33.3137 39 30V10Z"
            fill="white"
            shape-rendering="crispEdges"
          />
          <rect x="49" y="13" width="14" height="2" rx="1" fill={lineColor} />
          <rect x="49" y="19" width="14" height="2" rx="1" fill={lineColor} />
          <rect x="49" y="25" width="14" height="2" rx="1" fill={lineColor} />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_i_13161_30384"
          x="-1"
          y="2"
          width="76"
          height="36"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_13161_30384"
          />
        </filter>
        <filter
          id="filter1_d_13161_30384"
          x="35"
          y="0"
          width="42"
          height="40"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_13161_30384"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_13161_30384"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  )
}
