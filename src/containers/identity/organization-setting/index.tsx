import React, { memo } from 'react'

import PreviewDomain from './preview-domain'
import Settings from './settings'

type OrganizationSettingProps = {
  createdOrganizationSuccessfully: () => void
}

const OrganizationSetting = () => {
  return (
    <div className="flex h-full w-full overflow-hidden p-4">
      <div className="w-1/2">
        <Settings />
      </div>

      <div className="w-1/2">
        <PreviewDomain />
      </div>
    </div>
  )
}

export default memo(OrganizationSetting)
