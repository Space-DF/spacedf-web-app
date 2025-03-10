import { useTranslations } from 'next-intl'
import { Control } from 'react-hook-form'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Pen from '@/components/icons/pen'
import { EUIDevice } from './components/add-device/validator'
import { ColumnDef } from '@tanstack/react-table'
import { InputWithIcon } from '@/components/ui/input'
import { countTwoDigitNumbers, formatValueEUI } from '@/utils/format-eui'
import { ChevronDown, Fingerprint, IdCard, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { countries } from '@/data/country'
import DialogSaveDevice from './components/save-device'
import DialogDeleteDevice from './components/delete-device'

interface ColumnProps {
  t: ReturnType<typeof useTranslations>
  control: Control<EUIDevice>
  onRemoveRow: (idx: number) => void
  editDeviceIds: string[]
  onEditDevice: (id: string) => void
  onCancelEdit: (id: string) => void
  onSaveDevice: (id: string) => void
}

export const getDeviceColumns = (
  props: ColumnProps
): ColumnDef<EUIDevice['eui'][0]>[] => {
  const {
    t,
    onRemoveRow,
    editDeviceIds,
    control,
    onEditDevice,
    onCancelEdit,
    onSaveDevice,
  } = props
  return [
    {
      accessorKey: 'devEUI',
      header: 'Dev EUI',
      cell: ({ row }) => {
        const isEdit = editDeviceIds.includes(row.original.id)
        return isEdit ? (
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
                </FormItem>
              )
            }}
          />
        ) : (
          <span className="text-brand-component-text-gray text-xs font-medium">
            {row.original.devEUI}
          </span>
        )
      },
    },
    {
      accessorKey: 'joinEUI',
      header: 'Join EUI',
      cell: ({ row }) => {
        const isEdit = editDeviceIds.includes(row.original.id)
        return isEdit ? (
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
                </FormItem>
              )
            }}
          />
        ) : (
          <span className="text-brand-component-text-gray text-xs font-medium">
            {row.original.joinEUI}
          </span>
        )
      },
    },
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => {
        const isEdit = editDeviceIds.includes(row.original.id)
        return isEdit ? (
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
              </FormItem>
            )}
          />
        ) : (
          <span className="text-brand-component-text-gray text-xs font-medium">
            {row.original.name}
          </span>
        )
      },
    },
    {
      accessorKey: 'country',
      header: t('country'),
      cell({ row }) {
        const currentCountry = countries.find(
          (country) => country.code === row.original.country
        )
        const isEdit = editDeviceIds.includes(row.original.id)
        return isEdit ? (
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
                            {t('select_country')}
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
              </FormItem>
            )}
          />
        ) : (
          <span className="text-brand-component-text-gray text-xs font-medium">
            {`${currentCountry?.name} (${currentCountry?.code})`}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell({ getValue }) {
        return getValue() === 'active' ? (
          <span className="text-brand-component-text-positive font-medium">
            Active
          </span>
        ) : (
          <span className="text-brand-component-text-negative font-medium">
            Inactive
          </span>
        )
      },
    },
    {
      accessorKey: 'action',
      header: () => <div className="flex justify-center">{t('action')}</div>,
      cell({ row }) {
        const isEdit = editDeviceIds.includes(row.original.id)
        const onRemove = () => {
          onRemoveRow(row.index)
        }
        return (
          <FormField
            control={control}
            name={`eui.${row.index}.country`}
            render={({ formState }) => {
              const isDisabled = formState.errors.eui?.[row.index] !== undefined
              return (
                <div className="flex items-center justify-center space-x-2">
                  {isEdit ? (
                    <>
                      <DialogSaveDevice
                        disabled={isDisabled}
                        onSave={() => onSaveDevice(row.original.id)}
                      />
                      <button
                        className="border border-brand-component-stroke-dark-soft rounded-lg p-2"
                        onClick={() => onCancelEdit(row.original.id)}
                      >
                        <X className="size-4 text-brand-component-text-negative" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="border border-brand-component-stroke-dark-soft rounded-lg p-2"
                        onClick={() => onEditDevice(row.original.id)}
                      >
                        <Pen className="size-4 text-brand-fill-outermost" />
                      </button>
                      <DialogDeleteDevice onRemove={onRemove} />
                    </>
                  )}
                </div>
              )
            }}
          />
        )
      },
    },
  ]
}
