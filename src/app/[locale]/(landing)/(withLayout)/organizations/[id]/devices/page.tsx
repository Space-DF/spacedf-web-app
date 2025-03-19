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
import { useCreateDevice } from '@/containers/organizations/devices/hooks/useAddDevices'
import { useDeleteDevice } from '@/containers/organizations/devices/hooks/useDeleteDevice'
import { useDevices } from '@/containers/organizations/devices/hooks/useDevices'
import { useUpdateDevice } from '@/containers/organizations/devices/hooks/useUpdateDevice'
import { getDeviceColumns } from '@/containers/organizations/devices/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
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
  const { id } = useParams<{ id: string }>()
  const { data, mutate } = useDevices(id)
  const { trigger: createDevice, isMutating: isCreating } = useCreateDevice(id)
  const { trigger: updateDevice, isMutating: isUpdating } = useUpdateDevice(id)
  const { trigger: deleteDevice } = useDeleteDevice(id)
  const tableData = useMemo(() => data?.data || [], [data?.data])

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

  const onAddDevice = useCallback(async (devices: EUIDevice['eui']) => {
    await createDevice(devices)
    await mutate()
  }, [])

  const onSaveDevice = useCallback(
    async (id: string) => {
      const values = getValues()
      const newDevice = values.eui.find((device) => device.id === id)

      if (!newDevice) return
      await updateDevice(newDevice)
      await mutate()
      onEditDevice(id)
    },
    [getValues, mutate, onEditDevice, updateDevice]
  )

  const onRemoveRow = useCallback(
    async (index: number) => {
      const device = tableData[index]
      if (!device) return
      await deleteDevice({ id: device.id })
      mutate()
    },
    [tableData, mutate]
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
        isUpdating,
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
          <AddDeviceModal isLoading={isCreating} onAddDevice={onAddDevice}>
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
