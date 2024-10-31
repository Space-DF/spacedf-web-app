import { Building, UserList } from '@/components/icons'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import ImageWithBlur from '@/components/ui/image-blur'
import { Input, InputWithIcon } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { CloudUpload, MapPin, UserRound } from 'lucide-react'
import React, { Suspense } from 'react'
import AvtUser from '/public/images/avt-user.svg'

const Profile = () => {
  return (
    <div className="animate-opacity-display-effect">
      <p className="mb-3 font-semibold">Avatar</p>
      <div className="mb-4 flex gap-3">
        <Avatar className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-600">
          <Suspense fallback={<AvatarFallback>Avatar</AvatarFallback>}>
            <ImageWithBlur
              src={AvtUser || ''}
              width={40}
              height={40}
              alt="space-df"
            />
          </Suspense>
        </Avatar>
        <div className="flex flex-col items-stretch justify-between py-3">
          <Button
            variant="outline"
            className="w-max items-center gap-2 rounded-lg dark:text-white"
            size="lg"
          >
            Upload new image <CloudUpload size={16} />
          </Button>
          <p className="text-xs font-normal text-brand-text-gray">
            800x800 PNG, JPG is recommended. Maximum file size: 2Mb
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Name</Label>
          <InputWithIcon
            defaultValue={'Space User'}
            className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
            prefixCpn={<UserRound size={16} />}
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Location</Label>
          <InputWithIcon
            defaultValue={'Space Location'}
            className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
            prefixCpn={<MapPin size={16} />}
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Company Name</Label>
          <InputWithIcon
            defaultValue={'Digital Fortress'}
            className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
            prefixCpn={<Building />}
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Title</Label>
          <InputWithIcon
            defaultValue={'Software Engineer'}
            className="h-10 rounded-lg border-none bg-brand-fill-dark-soft shadow-none"
            prefixCpn={<UserList />}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button size="lg" variant="outline">
          Cancel
        </Button>
        <Button size="lg" className="flex-1">
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default Profile
