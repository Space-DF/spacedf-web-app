import { WaterDepthLevelName } from '@/utils/water-depth'

export const SourceColor = [
  '32BEB1',
  'A0D9D3',
  'F1EAD0',
  'F19985',
  'F27877',
  'F48A94',
  'D4EAA9',
  '99D689',
  'DBECC0',
  'FED2B5',
  'F7A7A6',
  'F7EFCB',
  'FAB28C',
  'FA8750',
  'FAAFC6',
  'FDD9D9',
  'E0ACF6',
  'E3A6A1',
  'ECEFC4',
  'DBD887',
  'D9C9F4',
  '8D9DF5',
  'BAD6FD',
  'F8D2C7',
  'ECC9DD',
  'F6D8CD',
  'DADDF0',
  'C6BEE7',
  'F6F1F5',
  'FFFFFF',
]

export const WATER_DEPTH_LEVEL_COLOR: Record<
  WaterDepthLevelName,
  { primary: string; secondary: string }
> = {
  safe: {
    primary: '#00836B',
    secondary: 'rgba(1, 209, 149, 0.1)',
  },
  caution: {
    primary: '#DAAE00',
    secondary: 'rgba(218, 174, 0, 0.1)',
  },
  warning: {
    primary: '#F58851',
    secondary: 'rgba(245, 136, 81, 0.1)',
  },
  critical: {
    primary: '#FB564B',
    secondary: 'rgba(251, 86, 75, 0.1)',
  },
}
