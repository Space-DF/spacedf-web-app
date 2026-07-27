import { ReactNode } from 'react'
import SpaceLockedGuard from '@/containers/space/space-locked/guard'

export default function SpaceSlugLayout({ children }: { children: ReactNode }) {
  return <SpaceLockedGuard>{children}</SpaceLockedGuard>
}
