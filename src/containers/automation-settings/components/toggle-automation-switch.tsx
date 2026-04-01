'use client'

import { Switch } from '@/components/ui/switch'
import { Automation } from '@/types/automation'
import { useEffect, useState } from 'react'
import { useToggleAutomation } from '../hooks/useToggleAutomation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface ToggleAutomationSwitchProps {
  automation: Automation
  onSuccess?: () => void
}

export const ToggleAutomationSwitch = ({
  automation,
  onSuccess,
}: ToggleAutomationSwitchProps) => {
  const serverActive = !!automation.event_rule?.is_active
  const [isActive, setIsActive] = useState(serverActive)
  const { trigger, isMutating } = useToggleAutomation(automation.id)
  const t = useTranslations('automation')
  useEffect(() => {
    setIsActive(serverActive)
  }, [serverActive])

  const handleChange = async () => {
    if (!automation.event_rule) return
    const next = !isActive
    setIsActive(next)
    await trigger(
      {
        ...automation,
        event_rule: { ...automation.event_rule, is_active: next },
        action_ids: automation.actions.map((action) => action.id),
      },
      {
        onSuccess: () => {
          onSuccess?.()
          toast.success(t('automation_status_updated_successfully'))
        },
        onError: (error) => {
          toast.error(error.message || t('automation_update_failed'))
          setIsActive(!next)
        },
      }
    )
  }

  return (
    <Switch
      checked={isActive}
      disabled={isMutating}
      onCheckedChange={handleChange}
    />
  )
}
