import { locales } from "@/i18n"
import { cn } from "@/lib/utils"
import { Locale } from "@/types/global"
import { SelectProps } from "@radix-ui/react-select"
import { useLocale, useTranslations } from "next-intl"
import { Suspense, useState, useTransition } from "react"
import { Avatar, AvatarFallback } from "./avatar"
import ImageWithBlur from "./image-blur"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import Link from "next/link"
import { usePathname, useRouter } from "@/navigation"

type Country = {
  code: Locale
  flag: string
  name: string
}

export const SelectCountry = (props: SelectProps) => {
  const currentLocale = useLocale()
  const t = useTranslations("languageName")
  const pathName = usePathname()
  const router = useRouter()

  // const segments = pathName.split("/")

  const getCountries = (): Country[] => {
    const differenceCountryCode = (code: Locale) => {
      if (code === "en") return "gb"
      if (code === "vi") return "vn"
      return code
    }

    const countries = locales.map((locale) => ({
      code: locale,
      flag: `https://flagcdn.com/${differenceCountryCode(locale)}.svg`,
      name: t(locale as any),
    }))

    return countries
  }

  const [selectedValue, setSelectedValue] = useState(currentLocale)

  const regionSelected =
    getCountries().find((region) => region.code === selectedValue) ||
    ({} as any)

  const handleChangeLocale = (newLocale: Locale) => {
    router.push(pathName, { locale: newLocale })
  }

  return (
    <Select
      onValueChange={(value) => {
        setSelectedValue(value)
        handleChangeLocale(value as Locale)
      }}
      {...props}
      defaultValue={currentLocale}
    >
      <SelectTrigger
        className={cn(
          "h-12 rounded-xl py-2 px-3 text-start bg-brand-fill-dark-soft border-none"
        )}
      >
        <SelectValue>
          <Language {...regionSelected} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {getCountries().map((region) => {
            return (
              <SelectItem key={region.code} value={region.code}>
                {/* <Link href={`/${segments[2]}`} locale={selectedValue}> */}
                <Language {...region} />
                {/* </Link> */}
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const Language = (country: Country) => {
  return (
    <div className="flex gap-2 items-center">
      <Avatar className="rounded-full flex items-center justify-center bg-purple-300 w-6 h-6">
        <Suspense fallback={<AvatarFallback>LG</AvatarFallback>}>
          <ImageWithBlur
            src={country.flag || ""}
            width={24}
            height={24}
            alt="country"
            className="object-cover"
          />
        </Suspense>
      </Avatar>
      <p className="font-semibold text-brand-heading  dark:text-white">
        {country.name}
      </p>
    </div>
  )
}
