'use client'

import React from 'react'
import { SpaceDelete } from './space-delete'
import { InformationTab } from './information-tab'
import { MemberTab } from './member-tab'
import { useSpaceSettings } from '@/stores/space-settings-store'
import { Space } from '@/types/space'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollText } from 'lucide-react'
import { UserList } from '@/components/icons'

type Step = 'information' | 'delete'

interface SpaceSettingsProps {
  spaceDetail: Space
  mutateSpaceDetails: () => void
}
export function SpaceSettings({
  spaceDetail,
  mutateSpaceDetails,
}: SpaceSettingsProps) {
  const t = useTranslations()
  const step = useSpaceSettings((state) => state.step)

  const steps: Record<Step, { component: React.ReactNode }> = {
    information: {
      component: (
        <div className="flex h-full animate-display-effect flex-col">
          <div className="flex items-center border-b border-brand-component-stroke-dark-soft p-4 font-semibold text-brand-component-text-dark">
            {t('common.workspace_settings')}
          </div>
          <div className="grow-1 flex-1 shrink-0 basis-0">
            <Tabs
              defaultValue="information"
              className="flex h-full animate-display-effect flex-col"
            >
              <TabsList className="relative flex h-auto w-full items-center justify-start rounded-none bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-brand-component-stroke-dark-soft">
                <TabsTrigger
                  value="information"
                  className="relative inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-none border-b-2 border-b-transparent px-4 py-3 text-sm font-semibold text-brand-component-text-dark shadow-none ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-brand-component-text-dark data-[state=active]:shadow-none"
                >
                  <ScrollText size={16} />
                  {t('space.informations')}
                </TabsTrigger>
                <TabsTrigger
                  value="member"
                  className="relative inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-none border-b-2 border-b-transparent px-4 py-3 text-sm font-semibold text-brand-component-text-dark shadow-none ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <UserList />
                  {t('space.members')}
                </TabsTrigger>
              </TabsList>
              <TabsContent className="mt-0 h-full" value="information">
                <InformationTab
                  space={spaceDetail}
                  mutateSpaceDetails={mutateSpaceDetails}
                />
              </TabsContent>
              <TabsContent className="mt-0 h-full" value="member">
                <MemberTab space={spaceDetail} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ),
    },
    delete: {
      component: <SpaceDelete space={spaceDetail} />,
    },
  }

  return (
    <div className="relative flex w-1/2 flex-1 flex-col overflow-hidden bg-brand-background-fill-outermost">
      {steps[step].component}
    </div>
  )
}
