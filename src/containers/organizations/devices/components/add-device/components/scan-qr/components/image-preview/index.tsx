import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { DetailedHTMLProps, ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Eye, Trash } from 'lucide-react'

interface Props
  extends DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  onClearImage: () => void
}

export default function ZoomableImage({
  src,
  alt,
  className,
  onClearImage,
}: Props) {
  if (!src) return null
  return (
    <Dialog>
      <div className="group relative rounded-lg overflow-hidden">
        <Image
          src={src}
          width={56}
          height={56}
          alt="image preview"
          className={cn('rounded-lg size-14 object-cover', className)}
        />
        <div className="absolute inset-0 bg-[#171A2880] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center space-x-2">
            <DialogTrigger asChild>
              <Eye className="text-white size-4 cursor-pointer" />
            </DialogTrigger>
            <Trash
              className="text-white size-4 cursor-pointer"
              onClick={onClearImage}
            />
          </div>
        </div>
      </div>
      <DialogContent className="border-0 bg-transparent p-0">
        <div className="relative h-[calc(100vh-220px)] w-full overflow-clip rounded-md bg-transparent shadow-md">
          <Image
            src={src}
            fill
            alt={alt || ''}
            className="h-full w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
