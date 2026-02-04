import { WATER_DEPTH_LEVEL_COLOR } from '@/constants'

export const WaterDepthLegend = () => {
  return (
    <div
      className="absolute bottom-10 right-3 w-[200px] rounded-lg h-max bg-white/90 backdrop-blur-sm z-[1000] p-3 shadow-sm
      dark:bg-[#171A28CC] dark:text-white"
    >
      <div className="flex items-center gap-2 mb-3">
        <WaterLevelLegendIcon />
        <span className="font-medium">Water Level</span>
      </div>

      <div className="px-1 space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded-full border-2 border-gray-200 dark:border-white/90"
            style={{ backgroundColor: WATER_DEPTH_LEVEL_COLOR.safe.primary }}
          />
          <span>0 &#8594; &lt;0.1m (Safe)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded-full border-2 border-gray-200 dark:border-white/90"
            style={{
              backgroundColor: WATER_DEPTH_LEVEL_COLOR.caution.primary,
            }}
          />
          <span>0.1 &#8594; &lt;0.3m (Caution)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded-full border-2 border-gray-200 dark:border-white/90"
            style={{
              backgroundColor: WATER_DEPTH_LEVEL_COLOR.warning.primary,
            }}
          />
          <span>0.3 &#8594; &le;0.6m (Warning)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="size-5 rounded-full border-2 border-gray-200 dark:border-white/90"
            style={{
              backgroundColor: WATER_DEPTH_LEVEL_COLOR.critical.primary,
            }}
          />
          <span> &gt;0.6m (Danger)</span>
        </div>
      </div>
    </div>
  )
}

const WaterLevelLegendIcon = () => (
  <svg
    width="20"
    height="16"
    viewBox="0 0 20 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 0.415898C20 0.183711 19.7967 -0.00273436 19.5662 0.0254688C17.4899 0.279414 17.3457 2.34598 14.9987 2.34598C12.498 2.34598 12.5007 0 10 0C7.50105 0 7.4984 2.34598 4.99945 2.34598C2.6534 2.34598 2.50918 0.279531 0.433789 0.0255078C0.20332 -0.00269532 0 0.18375 0 0.415938V14.5238C0 15.1716 0.525156 15.6968 1.17301 15.6968H18.827C19.4748 15.6968 20 15.1716 20 14.5238L20 0.415898Z"
      fill="#A9D8FF"
    />
    <path
      d="M20 4.69238C17.4993 4.69238 17.4993 7.03836 14.9987 7.03836C12.498 7.03836 12.5007 4.69238 10 4.69238C7.50105 4.69238 7.4984 7.03836 4.99945 7.03836C2.49973 7.03836 2.49973 4.69238 0 4.69238V14.5241C0 15.172 0.525156 15.6971 1.17301 15.6971H18.827C19.4748 15.6971 20 15.172 20 14.5241L20 4.69238Z"
      fill="#7AC0F9"
    />
    <path
      d="M20 9.38391C17.4993 9.38391 17.4993 11.7299 14.9987 11.7299C12.498 11.7299 12.5007 9.38391 10 9.38391C7.50105 9.38391 7.4984 11.7299 4.99945 11.7299C2.49973 11.7299 2.49973 9.38391 0 9.38391V14.5237C0 15.1715 0.525156 15.6967 1.17301 15.6967H18.827C19.4748 15.6967 20 15.1716 20 14.5237L20 9.38391Z"
      fill="#4EA7D8"
    />
  </svg>
)
