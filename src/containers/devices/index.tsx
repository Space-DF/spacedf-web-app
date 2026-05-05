import { memo, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { RightSideBarLayout } from '@/components/ui'
import { COOKIES, NavigationEnums } from '@/constants'
import { usePrevious } from '@/hooks/usePrevious'
import { getNewLayouts, useLayout } from '@/stores'
import { useDeviceStore } from '@/stores/device-store'
import { setCookie } from '@/utils'
import DeviceDetail from './components/device-detail'
import { DevicesList } from './components/device-list'
const Devices = () => {
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const setCookieDirty = useLayout((state) => state.setCookieDirty)
  const toggleDynamicLayout = useLayout((state) => state.toggleDynamicLayout)
  const setDeviceSelected = useDeviceStore((state) => state.setDeviceSelected)
  const deviceSelected = useDeviceStore((state) => state.deviceSelected)
  const previousDeviceSelected = usePrevious(deviceSelected)

  const handleCloseSlide = () => {
    setDeviceSelected('')
  }

  useEffect(() => {
    handleDeviceTabVisible()
  }, [deviceSelected, previousDeviceSelected, dynamicLayouts])

  useEffect(() => {
    const handle = (e: CustomEvent) => {
      const isChecked = e.detail.checked
      if (!isChecked) {
        handleCloseSlide()
      }
    }
    window.addEventListener('deviceLayoutUpdated', handle as EventListener)
    return () =>
      window.removeEventListener('deviceLayoutUpdated', handle as EventListener)
  }, [])

  const handleDeviceTabVisible = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (deviceSelected) {
      const isDeviceShow = dynamicLayouts.includes(NavigationEnums.DEVICES)
      if (!isDeviceShow) {
        const newLayout = getNewLayouts(dynamicLayouts, NavigationEnums.DEVICES)
        setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
        toggleDynamicLayout(NavigationEnums.DEVICES)
      }
    }
  }

  const handleClose = () => {
    const newLayout = getNewLayouts(dynamicLayouts, NavigationEnums.DEVICES)
    setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
    setCookieDirty(true)
    toggleDynamicLayout('devices')
    handleCloseSlide()
  }

  return (
    <RightSideBarLayout allowClose={false} className="relative">
      <DeviceDetail onClose={handleCloseSlide} open={!!deviceSelected} />

      <div className="flex h-full flex-col">
        <DevicesList onClose={handleClose} />
      </div>
    </RightSideBarLayout>
  )
}

export default memo(Devices)
