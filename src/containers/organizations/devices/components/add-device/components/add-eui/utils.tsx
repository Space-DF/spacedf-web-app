import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { Trash } from '@/components/icons/trash'
import { ChevronDown, Fingerprint, IdCard, KeyRound } from 'lucide-react'
import { InputWithIcon } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { countries } from '@/data/country'
import { Control, UseFieldArrayRemove } from 'react-hook-form'
import { EUIDevice } from '../../validator'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { countTwoDigitNumbers, formatValueEUI } from '@/utils/format-eui'
import { cn } from '@/lib/utils'

interface ColumnProps {
  t: ReturnType<typeof useTranslations>
  remove: UseFieldArrayRemove
  control: Control<EUIDevice>
}

interface Device {
  name: string
  country: string
  status: string
  id: string
  devEUI: string
  joinEUI: string
}

export const getEUIColumns = (props: ColumnProps): ColumnDef<Device>[] => {
  const { t, remove, control } = props

  return [
    {
      accessorKey: 'devEUI',
      header: 'DevEUI',
      size: 198,
      cell: ({ row }) => {
        return (
          <FormField
            control={control}
            name={`eui.${row.index}.devEUI`}
            render={({ field }) => {
              const binaryLength = countTwoDigitNumbers(field.value)
              return (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      prefixCpn={
                        <Fingerprint
                          size={16}
                          className="text-brand-stroke-gray"
                        />
                      }
                      className="pr-14"
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\s/g, '')
                        const binaryValue = formatValueEUI(rawValue)
                        const binaryLength = binaryValue.split(' ').length
                        if (
                          /^\d*$/.test(rawValue) &&
                          countTwoDigitNumbers(binaryValue) <= 8 &&
                          binaryLength <= 8
                        ) {
                          field.onChange(formatValueEUI(rawValue))
                        }
                      }}
                      suffixCpn={
                        <p
                          className={cn(
                            'text-brand-component-text-negative font-semibold text-xs',
                            binaryLength === 8 &&
                              'text-brand-component-text-positive'
                          )}
                        >
                          {binaryLength} byte
                          {Number(binaryLength) > 1 ? 's' : ''}
                        </p>
                      }
                      placeholder="Dev EUI"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        )
      },
    },
    {
      accessorKey: 'joinEUI',
      header: 'JoinEUI',
      cell: ({ row }) => (
        <FormField
          control={control}
          name={`eui.${row.index}.joinEUI`}
          render={({ field }) => {
            const binaryLength = countTwoDigitNumbers(field.value)
            return (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    placeholder="JoinEUI"
                    {...field}
                    value={field.value}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\s/g, '')
                      const binaryValue = formatValueEUI(rawValue)
                      const binaryLength = binaryValue.split(' ').length
                      if (
                        /^\d*$/.test(rawValue) &&
                        countTwoDigitNumbers(binaryValue) <= 8 &&
                        binaryLength <= 8
                      ) {
                        field.onChange(formatValueEUI(rawValue))
                      }
                    }}
                    suffixCpn={
                      <p
                        className={cn(
                          'text-brand-component-text-negative font-semibold text-xs',
                          binaryLength === 8 &&
                            'text-brand-component-text-positive'
                        )}
                      >
                        {binaryLength} byte
                        {Number(binaryLength) > 1 ? 's' : ''}
                      </p>
                    }
                    className="pl-3 pr-14"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
      ),
      size: 198,
    },
    {
      accessorKey: 'appKey',
      header: t('appKey'),
      cell: ({ row }) => (
        <FormField
          control={control}
          name={`eui.${row.index}.appKey`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputWithIcon
                  prefixCpn={
                    <KeyRound size={16} className="text-brand-stroke-gray" />
                  }
                  placeholder={t('appKey')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ),
      size: 198,
    },
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <FormField
          control={control}
          name={`eui.${row.index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputWithIcon
                  prefixCpn={
                    <IdCard size={16} className="text-brand-stroke-gray" />
                  }
                  placeholder="Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ),
      size: 198,
    },
    {
      accessorKey: 'country',
      header: t('country'),
      cell: ({ row }) => (
        <FormField
          control={control}
          name={`eui.${row.index}.country`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className="w-full bg-brand-fill-dark-soft"
                    icon={
                      <ChevronDown
                        size={18}
                        className="text-brand-stroke-gray"
                      />
                    }
                  >
                    <SelectValue
                      placeholder={
                        <span className="text-brand-component-text-gray font-medium">
                          Select country
                        </span>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ),
      size: 198,
    },
    {
      accessorKey: 'action',
      header: () => <p className="text-center">{t('action')}</p>,
      size: 108,
      cell({ row }) {
        return (
          <div className="flex justify-center">
            <button
              className="border border-brand-component-stroke-dark-soft rounded-lg p-2"
              onClick={() => remove(row.index)}
            >
              <Trash
                width={16}
                height={16}
                className="text-brand-stroke-gray"
              />
            </button>
          </div>
        )
      },
    },
  ]
}
