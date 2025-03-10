'use client'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Form } from '@/components/ui/form'
import { InputWithIcon } from '@/components/ui/input'
import AddDeviceModal from '@/containers/organizations/devices/components/add-device'
import {
  EUIDevice,
  EUISchema,
} from '@/containers/organizations/devices/components/add-device/validator'
import { getDeviceColumns } from '@/containers/organizations/devices/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

const DeviceOrganization = () => {
  const t = useTranslations('organization')
  const form = useForm<EUIDevice>({
    defaultValues: {
      eui: [],
    },
    resolver: zodResolver(EUISchema),
    mode: 'onChange',
  })
  const [editDeviceIds, setEditDeviceIds] = useState<string[]>([])
  const [tableData, setTableData] = useState<EUIDevice['eui']>([])

  const onEditDevice = useCallback((id: string) => {
    setEditDeviceIds((deviceIds) => {
      if (deviceIds.includes(id)) {
        return deviceIds.filter((deviceId) => deviceId !== id)
      }
      return [...deviceIds, id]
    })
  }, [])

  const {
    control,
    reset,
    setValue,
    formState: { defaultValues },
    getValues,
  } = form

  const onCancelEdit = useCallback(
    (id: string) => {
      onEditDevice(id)
      const currentIndex = defaultValues?.eui?.findIndex(
        (device) => device?.id === id
      )
      if (
        currentIndex !== undefined &&
        currentIndex > -1 &&
        defaultValues?.eui?.[currentIndex]
      ) {
        setValue(
          `eui.${currentIndex}`,
          {
            ...defaultValues?.eui?.[currentIndex],
            name: defaultValues?.eui?.[currentIndex]?.name || '',
            country: defaultValues?.eui?.[currentIndex]?.country || '',
            status: defaultValues?.eui?.[currentIndex]?.status || '',
            id: defaultValues?.eui?.[currentIndex]?.id || '',
            devEUI: defaultValues?.eui?.[currentIndex]?.devEUI || '',
            joinEUI: defaultValues?.eui?.[currentIndex]?.joinEUI || '',
          },
          {
            shouldDirty: false,
          }
        )
      }
    },
    [defaultValues]
  )

  useEffect(() => {
    reset({ eui: tableData })
  }, [tableData])

  const onAddDevice = useCallback((devices: EUIDevice['eui']) => {
    setTableData((prev) => [...prev, ...devices])
  }, [])

  const onSaveDevice = useCallback(
    (id: string) => {
      const values = getValues()
      const newDevice = values.eui.find((device) => device.id === id)

      if (!newDevice) return

      setTableData((prev) => {
        const index = prev.findIndex((p) => p.id === id)
        if (index === -1 || prev[index] === newDevice) return prev

        const updatedTable = [...prev]
        updatedTable[index] = newDevice
        return updatedTable
      })
      onEditDevice(id)
    },
    [getValues, setTableData, onEditDevice]
  )

  const onRemoveRow = useCallback(
    (index: number) => {
      setTableData((prev) => prev.filter((_, idx) => idx !== index))
    },
    [setTableData]
  )

  const columns = useMemo(
    () =>
      getDeviceColumns({
        t,
        control,
        onRemoveRow,
        editDeviceIds,
        onEditDevice,
        onCancelEdit,
        onSaveDevice,
      }),
    [
      control,
      onRemoveRow,
      editDeviceIds,
      onEditDevice,
      onCancelEdit,
      onSaveDevice,
    ]
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="font-bold text-xl">{t('devices')}</p>
        <div className="flex items-center space-x-2">
          <InputWithIcon
            prefixCpn={<Search size={16} />}
            placeholder={t('search')}
          />
          <AddDeviceModal onAddDevice={onAddDevice}>
            <Button>{t('add_device')}</Button>
          </AddDeviceModal>
        </div>
      </div>
      <Form {...form}>
        <DataTable
          data={tableData}
          columns={columns}
          emptyLabel={t('no_devices')}
          showPaginate={false}
        />
      </Form>
    </div>
  )
}

export default DeviceOrganization
