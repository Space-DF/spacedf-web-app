import ImageWithBlur from "@/components/ui/image-blur"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import React, { memo, useState } from "react"
import QRCodeSVG from "/public/images/qr-code.svg"
import { TypographySecondary } from "@/components/ui/typography"

const QRCode = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="w-full flex items-center cursor-pointer flex-col"
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <div className="flex gap-2 items-center font-medium mb-4">
        Login with QR Code
        <ChevronDown className={cn("duration-300", isOpen && "rotate-180")} />
      </div>

      <div className="flex flex-col items-center">
        <div
          className={cn(
            "overflow-hidden duration-300",
            isOpen ? "w-36 h-36 opacity-100" : "h-0 opacity-0"
          )}
        >
          <ImageWithBlur
            className="w-full h-full"
            src={QRCodeSVG}
            alt="qr-code"
          />
        </div>

        <TypographySecondary
          className={cn(
            "font-normal text-center text-brand-text-gray mt-2",
            isOpen ? "h-max opacity-100" : "h-0 opacity-0"
          )}
        >
          Scan this code with the{" "}
          <strong className="text-brand-text-dark dark:text-white">
            SpaceDF App
          </strong>
          <br />
          to log in instantly.
        </TypographySecondary>
      </div>
    </div>
  )
}

export default memo(QRCode)
