import ImageWithBlur from "@/components/ui/image-blur"
import { Input } from "@/components/ui/input"
import { useIdentityStore } from "@/stores/identity-store"
import React from "react"
import { useShallow } from "zustand/react/shallow"
import OrganizationThumb from "/public/images/organization-thumb.svg"
import { Camera } from "lucide-react"
import CameraFilled from "@/components/icons/camera-filled"
import { TypographyPrimary } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"

const CreateOrganization = () => {
  const { setOrganizationName, organizationName } = useIdentityStore(
    useShallow((state) => ({
      organizationName: state.organizationName,
      setOrganizationName: state.setOrganizationName,
    }))
  )

  return (
    <div className="aw-full">
      <div className="flex items-stretch gap-2 mb-8">
        <div className="relative w-[88px] h-[76px]">
          <div className="absolute w-[76px] rounded-lg h-[76px] overflow-hidden">
            <ImageWithBlur
              src={OrganizationThumb}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>

          <div className="bg-white absolute p-1 rounded-full bottom-0 right-0 translate-y-1 dark:bg-brand-fill-outermost">
            <CameraFilled className="text-brand-text-gray" />
          </div>
        </div>
        <div className="flex flex-col items-start flex-1 shrink justify-between">
          <TypographyPrimary className="font-medium">
            Organization name
          </TypographyPrimary>
          <Input
            defaultValue={organizationName}
            className="border-none"
            placeholder="Organization name"
            onChange={(event) => {
              setOrganizationName(event.target.value)
            }}
          />
        </div>
      </div>

      <Button>Continue</Button>
    </div>
  )
}

export default CreateOrganization
