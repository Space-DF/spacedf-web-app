import Image from 'next/image'

const SpacedfLogo = () => {
  return (
    <div className="absolute top-0 left-0 z-10">
      <div className="bg-gradient-to-r from-[#6E4AFF] to-[#CCBFFF] p-[1px] rounded-lg m-3 mt-[16px]">
        <div className="w-32 h-[38px] p-2 rounded-lg bg-gradient-to-b from-[#171a28b3] to-[#1f2336b3] bg-white dark:bg-brand-fill-outermost backdrop-blur-xs pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <Image
              src="/images/spacedf-logo.svg"
              alt="spacedf-logo"
              width={114}
              height={24}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpacedfLogo
