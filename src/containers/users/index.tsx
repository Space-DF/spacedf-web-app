import { RightSideBarLayout } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Nodata } from '@/components/ui/no-data'
import { useLayout } from '@/stores'
import { uppercaseFirstLetter } from '@/utils'
import { PlusIcon } from '@radix-ui/react-icons'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'

const Users = () => {
  const t = useTranslations('common')

  const setCookieDirty = useLayout((state) => state.setCookieDirty)
  const toggleDynamicLayout = useLayout((state) => state.toggleDynamicLayout)

  return (
    <RightSideBarLayout
      onClose={() => {
        setCookieDirty(true)
        toggleDynamicLayout('user')
      }}
      title={t('selected_user')}
    >
      <Nodata content={t('nodata', { module: t('user') })} />
      <div className="flex items-center justify-center">
        <Button size="default" className="mt-3 gap-2 rounded-lg">
          {uppercaseFirstLetter(t('add'))} {t('user')} <PlusIcon />
        </Button>
      </div>
    </RightSideBarLayout>
  )
}

export default memo(Users)
