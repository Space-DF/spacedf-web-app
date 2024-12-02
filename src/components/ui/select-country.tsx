import { SelectProps } from '@radix-ui/react-select'
import { useLocale, useTranslations } from 'next-intl'
import { Suspense, useState } from 'react'
import { locales } from '@/i18n/request'
import { usePathname, useRouter } from '@/i18n/routing'
import { Locale } from '@/types/global'
import { Avatar, AvatarFallback } from './avatar'
import ImageWithBlur from './image-blur'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { ChevronDown } from 'lucide-react'

type Country = {
  code: Locale
  flag: string
  name: string
}

export const SelectCountry = (props: SelectProps) => {
  const currentLocale = useLocale()
  const t = useTranslations('languageName')
  const pathName = usePathname()
  const router = useRouter()

  // const segments = pathName.split("/")

  const getCountries = (): Country[] => {
    const differenceCountryCode = (code: Locale) => {
      if (code === 'en') return 'gb'
      if (code === 'vi') return 'vn'
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
        className="rounded-lg border-none bg-brand-fill-dark-soft px-3 py-2 text-start shadow-none"
        icon={<ChevronDown size={16} className="text-brand-text-gray" />}
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
    <div className="flex items-center gap-2">
      <p className="text-sm font-medium text-brand-heading dark:text-white">
        {country.name}
      </p>
    </div>
  )
}
