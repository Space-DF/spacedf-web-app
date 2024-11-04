import ImageWithBlur from '@/components/ui/image-blur'
import { Input } from '@/components/ui/input'
import { useIdentityStore } from '@/stores/identity-store'
import React, { useEffect, useRef, useState, useTransition } from 'react'
import { useShallow } from 'zustand/react/shallow'
import OrganizationThumb from '/public/images/organization-thumb.svg'
import { Camera, XCircle } from 'lucide-react'
import CameraFilled from '@/components/icons/camera-filled'
import { TypographyPrimary } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { generateOrganizationDomain, uppercaseFirstLetter } from '@/utils'
import { createOrganizationAction } from '../../action'
import { toast } from 'sonner'

const CreateOrganization = () => {
  const { setOrganizationName, organizationName, setOrganizationDomain } =
    useIdentityStore(
      useShallow((state) => ({
        organizationName: state.organizationName,
        setOrganizationName: state.setOrganizationName,
        setOrganizationDomain: state.setOrganizationDomain,
      })),
    )

  const [errorSlug, setErrorSlug] = useState('')
  const [organizationDomain, setOrganization] = useState('')

  // const enableManualDomain = useRef(!!errorSlug)

  const [isCreating, startCreateOrganization] = useTransition()

  useEffect(() => {
    setOrganization(generateOrganizationDomain(organizationName))
  }, [organizationName])

  return (
    <div className="aw-full">
      <div className="mb-8 flex flex-col gap-3">
        <div className="relative h-[76px] w-[88px]">
          <div className="absolute h-[76px] w-[76px] overflow-hidden rounded-lg">
            <ImageWithBlur
              src={OrganizationThumb}
              className="h-full w-full object-cover"
              alt=""
            />
          </div>

          <div className="absolute bottom-0 right-0 translate-y-1 rounded-full bg-white p-1 dark:bg-brand-fill-outermost">
            <CameraFilled className="text-brand-text-gray" />
          </div>
        </div>
        <TypographyPrimary className="text-base font-medium">
          Organization name
        </TypographyPrimary>
        <Input
          defaultValue={organizationName}
          className="h-10 border-none"
          placeholder="Digital Fortress"
          onChange={(event) => {
            setErrorSlug('')
            setOrganizationName(event.target.value)
          }}
        />

        <TypographyPrimary className="text-base font-medium">
          Domain
        </TypographyPrimary>

        <Input
          value={organizationDomain}
          className="h-10 border-none"
          placeholder="digitalfortress"
          disabled={!errorSlug}
          endAdornment={<div>.spacedf.com</div>}
          onChange={(event) => setOrganization(event.target.value)}
        />
        {errorSlug && (
          <div className="flex gap-2 text-destructive">
            <XCircle size={14} />
            <p className="text-xs">{uppercaseFirstLetter(errorSlug)}</p>
          </div>
        )}
      </div>

      <Button
        disabled={!organizationName}
        loading={isCreating}
        onClick={() => {
          startCreateOrganization(async () => {
            const response = await fetch('/api/console/organization', {
              method: 'POST',
              body: JSON.stringify({
                name: organizationName,
                slug_name: organizationDomain,
                logo: '123',
              }),
            })

            const dataResponse = await response.json()

            if (response.ok) {
              toast.success('Organization created successfully!')
              setOrganization(dataResponse.data.slug_name)
            }

            // if (response.ok) {
            //   toast.success('Organization created successfully!')
            //   setOrganization('digital-fortress')
            // }

            // if (responseMessage === 'Success') {
            //   setOrganizationDomain(organizationDomain)
            // }
            // if (responseMessage.detail) {
            //   toast.error(responseMessage.detail)
            // }

            // if (responseMessage.slug_name) {
            //   setErrorSlug(responseMessage.slug_name[0])
            // }
          })
        }}
      >
        Continue
      </Button>
    </div>
  )
}

export default CreateOrganization
