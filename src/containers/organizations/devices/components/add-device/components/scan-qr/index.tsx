import { Scanner } from '@yudiel/react-qr-scanner'
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import NodataSVG from '/public/images/nodata.svg'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import CloudArrowUp from '@/components/icons/cloud-arrow-up'
import ZoomableImage from './components/image-preview'
import { useTranslations } from 'next-intl'

interface Props {
  setFile: Dispatch<SetStateAction<File | undefined>>
  file?: File
}

const ScanQR: React.FC<Props> = ({ setFile, file }) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string>()
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFile(e.target.files?.[0])
    },
    [setFile]
  )
  const t = useTranslations('organization')

  const onClearImage = useCallback(() => setFile(undefined), [setFile])

  useEffect(() => {
    setImage(file ? URL.createObjectURL(file) : undefined)
  }, [file])

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className=" flex justify-center">
        <div className="[&>div>div>div>svg>path]:!stroke-brand-fill-outermost rounded-[20px] overflow-hidden">
          <Scanner
            onScan={(result) => {
              console.info(
                `\x1b[34mFunc: Scanner - PARAMS: result\x1b[0m`,
                result
              )
            }}
            styles={{
              container: {
                width: 372,
                height: 372,
              },
            }}
            onError={(err) => {
              console.info(`\x1b[34mFunc: Scanner - PARAMS: err\x1b[0m`, err)
            }}
          />
        </div>
      </div>
      <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-brand-component-stroke-dark-soft after:mt-0.5 after:flex-1 after:border-t after:border-brand-component-stroke-dark-soft">
        <p className="mx-4 mb-0 text-center font-semibold text-brand-component-text-gray text-xs">
          Or
        </p>
      </div>
      <div className="flex items-center space-x-3 justify-center">
        {image && (
          <ZoomableImage
            src={image}
            width={56}
            height={56}
            alt="image preview"
            className="rounded-lg size-14"
            onClearImage={onClearImage}
          />
        )}
        <div className="flex items-center space-x-3">
          <Image
            width={56}
            height={56}
            src={NodataSVG}
            alt="nodata"
            className="size-14"
          />
          <div className="space-y-2">
            <div className="flex space-x-2 items-center">
              <Button
                variant="outline"
                className="flex space-x-2"
                onClick={() => fileRef.current?.click()}
              >
                <span>{t('upload_image')} </span>
                <CloudArrowUp className="text-black" />
              </Button>
            </div>
            <p className="text-brand-component-text-gray text-xs font-normal">
              {t('format_recommended')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ScanQR)
