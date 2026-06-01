import { useMoveDeviceStore } from '@/stores/template/move-device'
import { useAssignDeviceModel } from '../../dialog-select-device-from-list/hooks/useAssignDeviceModel'
import { useAddDeviceStore } from '@/stores/template/add-device'
import { useGetDevices } from '@/hooks/useDevices'
import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

export function useSaveMovedDevice() {
  const { deviceId, position, reset } = useMoveDeviceStore(
    useShallow((state) => ({
      deviceId: state.deviceId,
      position: state.position,
      reset: state.reset,
    }))
  )
  const { mutateAsync: assignDevice, isPending } = useAssignDeviceModel()
  const buildingId = useAddDeviceStore((state) => state.building?.id)
  const { data: devices } = useGetDevices({ buildingId })

  const save = useCallback(
    async (customPos?: { x: number; y: number; z: number }) => {
      const posToSave = customPos || position
      if (!deviceId || !posToSave) return
      const device = devices.find((d) => d.id === deviceId)
      const finalBuildingId = device?.building?.id || buildingId
      if (!finalBuildingId) {
        reset()
        return
      }

      await assignDevice(
        {
          deviceId,
          buildingId: finalBuildingId,
          position: posToSave,
        },
        {
          onSuccess() {
            reset()
          },
        }
      )
    },
    [deviceId, position, devices, buildingId, assignDevice, reset]
  )

  return { save, isSaving: isPending }
}
