'use client'

import { Organization } from '@/types/organization'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link2, PanelsTopLeft, UsersRound } from 'lucide-react'
import ImageWithBlur from '@/components/ui/image-blur'
import { useUpdateOrganization } from '../hooks/useUpdateOrganization'

export function OrganizationItem(props: Organization) {
  const t = useTranslations('organization')

  const { trigger } = useUpdateOrganization()

  return (
    <div className="border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost rounded-xl p-3 flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="rounded px-2 py-0.5 bg-[#CCE9FF] text-brand-component-text-info font-semibold text-xs">
            {t('pro_plan')}
          </div>
          <div>
            <Switch
              className="h-6 w-10"
              thumbClassName="size-5"
              defaultChecked={props.is_active}
              onCheckedChange={(checked) =>
                trigger({
                  id: props.id,
                  name: props.name,
                  logo: props.logo,
                  slug_name: props.slug_name,
                  is_active: checked,
                })
              }
            />
          </div>
        </div>
        <div className="flex gap-1">
          <div>
            <ImageWithBlur
              src={props.logo}
              alt={props.name}
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1 flex-col flex gap-1.5">
            <div className="text-brand-component-text-dark text-[16px] leading-6">
              {props.name}
            </div>
            <div className="text-brand-component-text-gray text-xs flex items-center gap-2">
              <span>{t('owned_by')}</span>
              <span className="flex items-center gap-1">
                <Avatar className="size-[18px] text-xs">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>Q</AvatarFallback>
                </Avatar>
                <span>Quynh Nguyen</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="bg-brand-component-fill-dark-soft rounded py-1 px-2 flex items-center gap-1 text-brand-component-text-dark text-xs">
          <PanelsTopLeft className="text-brand-icon-gray" size={18} />
          <span>{t('spaces', { count: 0 })}</span>
        </div>
        <div className="bg-brand-component-fill-dark-soft rounded py-1 px-2 flex items-center gap-1 text-brand-component-text-dark text-xs">
          <UsersRound className="text-brand-icon-gray" size={18} />
          <span>{t('members', { count: 0 })}</span>
        </div>
      </div>
      <div>
        <div className="bg-brand-component-fill-dark-soft rounded py-1 px-2 inline-flex items-center gap-1 text-brand-component-text-dark text-xs">
          <Link2 size={16} className="-rotate-45 text-brand-icon-gray" />
          <span>{props.slug_name}.spacedf.net</span>
        </div>
      </div>
    </div>
  )
}
