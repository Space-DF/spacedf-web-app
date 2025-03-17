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
import { ColumnDef, Row } from '@tanstack/react-table'
import { InputWithIcon } from '@/components/ui/input'
import { countTwoDigitNumbers, formatValueEUI } from '@/utils/format-eui'
import { ChevronDown, Fingerprint, IdCard, KeyRound, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { countries } from '@/data/country'
import DialogSaveDevice from './components/save-device'
import DialogDeleteDevice from './components/delete-device'
import React from 'react'

interface ColumnProps {
  t: ReturnType<typeof useTranslations>
  control: Control<EUIDevice>
  onRemoveRow: (idx: number) => void
  editDeviceIds: string[]
  onEditDevice: (id: string) => void
  onCancelEdit: (id: string) => void
  onSaveDevice: (id: string) => void
  isUpdating?: boolean
}

type DeviceTableProps = EUIDevice['eui'][0]

export const getDeviceColumns = (
  props: ColumnProps
): ColumnDef<DeviceTableProps>[] => {
  const {
    t,
    onRemoveRow,
    editDeviceIds,
    control,
    onEditDevice,
    onCancelEdit,
    onSaveDevice,
    isUpdating,
  } = props

  const renderEUIField = (
    row: Row<DeviceTableProps>,
    fieldName: keyof DeviceTableProps,
    placeholder: string,
    icon?: JSX.Element
  ) => {
    const isEdit = editDeviceIds.includes(row.original.id)
    const binaryLength = countTwoDigitNumbers(row.original[fieldName])

    return isEdit ? (
      <FormField
        control={control}
        name={`eui.${row.index}.${fieldName}`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <InputWithIcon
                prefixCpn={icon}
                className={cn('pr-14', !icon && 'pl-3')}
                placeholder={placeholder}
                {...field}
                value={field.value}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\s/g, '')
                  const binaryValue = formatValueEUI(rawValue)
                  if (
                    /^\d*$/.test(rawValue) &&
                    countTwoDigitNumbers(binaryValue) <= 8 &&
                    binaryValue.split(' ').length <= 8
                  ) {
                    field.onChange(binaryValue)
                  }
                }}
                suffixCpn={
                  <p
                    className={cn(
                      'text-brand-component-text-negative font-semibold text-xs',
                      binaryLength === 8 && 'text-brand-component-text-positive'
                    )}
                  >
                    {binaryLength} byte{binaryLength > 1 ? 's' : ''}
                  </p>
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
    ) : (
      <span className="text-brand-component-text-gray text-xs font-medium">
        {row.original[fieldName]}
      </span>
    )
  }

  const renderTextField = (
    row: Row<DeviceTableProps>,
    fieldName: keyof DeviceTableProps,
    placeholder: string,
    icon: JSX.Element
  ) => {
    const isEdit = editDeviceIds.includes(row.original.id)
    return isEdit ? (
      <FormField
        control={control}
        name={`eui.${row.index}.${fieldName}`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <InputWithIcon
                prefixCpn={icon}
                placeholder={placeholder}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    ) : (
      <span className="text-brand-component-text-gray text-xs font-medium">
        {row.original[fieldName]}
      </span>
    )
  }

  return [
    {
      accessorKey: 'devEUI',
      header: 'Dev EUI',
      cell: ({ row }) =>
        renderEUIField(
          row,
          'devEUI',
          'Dev EUI',
          <Fingerprint size={16} className="text-brand-stroke-gray" />
        ),
    },
    {
      accessorKey: 'joinEUI',
      header: 'Join EUI',
      cell: ({ row }) => renderEUIField(row, 'joinEUI', 'Join EUI'),
    },
    {
      accessorKey: 'appKey',
      header: t('appKey'),
      cell: ({ row }) =>
        renderTextField(
          row,
          'appKey',
          'App key',
          <KeyRound size={16} className="text-brand-stroke-gray" />
        ),
    },
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) =>
        renderTextField(
          row,
          'name',
          'Name',
          <IdCard size={16} className="text-brand-stroke-gray" />
        ),
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
                        isLoading={isUpdating}
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
