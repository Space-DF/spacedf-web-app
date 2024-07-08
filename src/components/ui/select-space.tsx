"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SelectProps } from "@radix-ui/react-select"
import { Suspense, useState } from "react"
import LogoSVG from "/public/space_df_logo.svg"
import ImageWithBlur from "@/components/ui/image-blur"
import { cn } from "@/lib/utils"

type User = {
  id: string
  title: string
  role?: string
  thumbnail?: string
}

const userList: User[] = [
  {
    id: "1",
    title: "Water Management",
    role: "Owner",
    thumbnail:
      "https://s3-alpha-sig.figma.com/img/1988/998a/bc4621ffd7d2c54eda495c25245def73?Expires=1720396800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=cwj3zU6eexo5y-uVGbJ38R0w8Fc1XVFRASYhQJaRVah~M78shBE6~aKO5gCfogI-BZ3tk03LggZ8Cphg9enFV6W-hJ0O-PDCOXFgz3ZoHTQFCknhqMfZD0CKGx-DzOBuRZLnM9tx0dm36b6RsmbxZR2DySEOsWViZAAALpmw-RpqIR16ZUM8hrhXFgNzGzzaaoKS8lNMbW5Ju90zldZUaucAprugzPH1zOiksBQ4fpKgwUnKkUVia2RI3wYS9bxI7KAj7kmAoiwQsyrXijt3LIgBB7wcTZmH3jg3wjcy2OLyJcdVrsRcKOvxTB6mKIOwVBYBVkEfX2BM7nFLsXOQjQ__",
  },
  {
    id: "2",
    title: "Smart Office",
    role: "Owner",
    thumbnail:
      "https://s3-alpha-sig.figma.com/img/1988/998a/bc4621ffd7d2c54eda495c25245def73?Expires=1720396800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=cwj3zU6eexo5y-uVGbJ38R0w8Fc1XVFRASYhQJaRVah~M78shBE6~aKO5gCfogI-BZ3tk03LggZ8Cphg9enFV6W-hJ0O-PDCOXFgz3ZoHTQFCknhqMfZD0CKGx-DzOBuRZLnM9tx0dm36b6RsmbxZR2DySEOsWViZAAALpmw-RpqIR16ZUM8hrhXFgNzGzzaaoKS8lNMbW5Ju90zldZUaucAprugzPH1zOiksBQ4fpKgwUnKkUVia2RI3wYS9bxI7KAj7kmAoiwQsyrXijt3LIgBB7wcTZmH3jg3wjcy2OLyJcdVrsRcKOvxTB6mKIOwVBYBVkEfX2BM7nFLsXOQjQ__",
  },
]

/**
 *@author: this is the component with hard coded. we will use the data from the API to data
 */
const SelectSpace = ({
  triggerClass,
  contentClass,
  ...resProps
}: SelectProps & {
  triggerClass?: string
  contentClass?: string
}) => {
  const [selectedValue, setSelectedValue] = useState(resProps.defaultValue)
  const userSelected =
    userList.find((user) => user.id === selectedValue) || ({} as User)

  return (
    <Select onValueChange={setSelectedValue} {...resProps}>
      <SelectTrigger
        className={cn("h-12 rounded-xl p-1 text-start", triggerClass)}
      >
        <SelectValue>
          <Space {...userSelected} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent className={cn(contentClass)}>
        <SelectGroup>
          {userList.map((user) => {
            return (
              <SelectItem key={user.id} value={user.id}>
                <Space {...user} />
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const Space = ({ thumbnail, title, role }: User) => (
  <div className="flex gap-2">
    <Avatar className="rounded-lg flex items-center justify-center bg-purple-300">
      <Suspense fallback={<AvatarFallback>LG</AvatarFallback>}>
        <ImageWithBlur
          src={thumbnail || ""}
          width={40}
          height={40}
          alt="space-df"
        />
      </Suspense>
    </Avatar>
    <div className="flex flex-col justify-between">
      <p className="font-semibold text-brand-heading">{title}</p>
      <span className="text-xs font-medium text-brand-text-gray">{role}</span>
    </div>
  </div>
)

export default SelectSpace
