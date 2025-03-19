import OrganizationSidebar from '@/containers/organizations/components/sidebar'
import React from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getCookieServer } from '@/utils/server-actions'

interface Props {
  children: React.ReactNode
  params: { [key: string]: string }
}

const OrganizationLayout = async ({ children, params }: Props) => {
  const { id } = params
  const isOpenSidebar = await getCookieServer('sidebar_state', true)
  return (
    <SidebarProvider defaultOpen={isOpenSidebar}>
      <OrganizationSidebar isOpen={isOpenSidebar} id={id} />
      <SidebarInset>
        <div className="mt-6">
          <div className="mx-10">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default OrganizationLayout
