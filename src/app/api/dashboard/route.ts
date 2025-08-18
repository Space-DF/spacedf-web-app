import { isDemoSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export interface Dashboard {
  value: string
  label: string
  isDefault: boolean
  id: number
}

const DASHBOARDS: Dashboard[] = [
  {
    value: 'next.js',
    label: 'Smart Fleet Monitor',
    isDefault: true,
    id: 1,
  },
  {
    value: 'sveltekit',
    label: 'Dashboard 2',
    isDefault: false,
    id: 2,
  },
  {
    value: 'nuxt.js',
    label: 'Dashboard 3',
    isDefault: false,
    id: 3,
  },
  {
    value: 'remix',
    label: 'Dashboard 4',
    isDefault: false,
    id: 4,
  },
  {
    value: 'astro',
    label: 'Dashboard 5',
    isDefault: false,
    id: 5,
  },
]

const DEMO_DASHBOARDS: Dashboard[] = [
  {
    value: '1',
    label: 'Smart Fleet Monitor',
    isDefault: true,
    id: 1,
  },
  {
    value: '2',
    label: 'Custom Color Dashboard',
    isDefault: false,
    id: 2,
  },
  {
    value: '3',
    label: 'Default Monitor',
    isDefault: false,
    id: 3,
  },
]

export const GET = async (request: NextRequest) => {
  const isDemo = await isDemoSubdomain(request)
  if (isDemo) {
    return NextResponse.json(DEMO_DASHBOARDS)
  }
  return NextResponse.json(DASHBOARDS)
}
