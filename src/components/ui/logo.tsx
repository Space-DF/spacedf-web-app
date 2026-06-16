import { cn } from '@/lib/utils'
import ImageWithBlur from './image-blur'
import LogoSVG from '/public/space_df_logo.svg'
import LogoBlur from '/public/space_df_logo_blur.svg'

export const Logo = ({
  allowAnimation = true,
}: {
  allowAnimation?: boolean
}) => {
  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center',
        allowAnimation && 'animate-bounce-slow'
      )}
    >
      <link
        rel="preload"
        href="/space_df_logo_blur.svg"
        as="image"
        {...({ fetchPriority: 'high' } as any)}
      />
      <link
        rel="preload"
        href="/space_df_logo.svg"
        as="image"
        {...({ fetchPriority: 'high' } as any)}
      />
      <div className="absolute z-0 flex h-[80%] w-[80%] items-center justify-center">
        <ImageWithBlur
          src={LogoSVG}
          alt="space_df_logo"
          className="h-full w-full blur-sm duration-1000"
          priority
        />
      </div>
      <div className="absolute z-10 h-full w-full bg-[url('/space_df_logo_blur.svg')] bg-cover bg-center bg-no-repeat">
        <ImageWithBlur
          src={LogoBlur}
          alt="space_df_logo"
          className="h-full w-full blur-sm duration-700"
          priority
        />
      </div>
    </div>
  )
}
