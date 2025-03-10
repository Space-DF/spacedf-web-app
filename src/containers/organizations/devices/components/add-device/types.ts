export enum AddDeviceType {
  Auto = 'auto',
  Manual = 'manual',
}

export interface Steps {
  label: string
  description?: string
  component: React.ReactNode
}

export enum Step {
  SelectMode = 'select_mode',
  ScanQR = 'scan_qr',
  SelectProtocol = 'select_protocol',
  AddEUI = 'add_eui',
  AddDeviceManual = 'add_device_manual',
  AddDeviceAuto = 'add_device_auto',
  Loading = 'loading',
  AddDeviceSuccess = 'add_device_success',
}
