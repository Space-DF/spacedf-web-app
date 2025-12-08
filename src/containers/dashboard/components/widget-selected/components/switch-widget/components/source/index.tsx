import { CaretDown } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import { SwitchPayload } from '@/validator'
import { useFormContext, useWatch } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { useDeviceEntity } from '../../../../hooks/useDeviceEntity'
import { useMemo } from 'react'

const SwitchSource = () => {
  const t = useTranslations('dashboard')
  const form = useFormContext<SwitchPayload>()

  const selectedEntityIds = useWatch({
    control: form.control,
    name: 'source.entity_ids',
  })

  const { data: entities } = useDeviceEntity('switch')
  const entityList = entities?.results || []

  const entityNames = useMemo(() => {
    return entityList
      .filter((entity) => selectedEntityIds.includes(entity.id))
      .map((entity) => entity.name)
      .join(', ')
  }, [entityList, selectedEntityIds])
  const handleSelectEntity = (entityId: string) => {
    const entityIds = form.getValues('source.entity_ids')
    const isSelected = entityIds.includes(entityId)
    const updatedEntityIds = isSelected
      ? entityIds.filter((id) => id !== entityId)
      : [...entityIds, entityId]
    form.setValue('source.entity_ids', updatedEntityIds)
  }

  const isError = form.formState.errors.source?.entity_ids

  return (
    <div className="size-full">
      <FormField
        control={form.control}
        name="source.entity_ids"
        render={() => (
          <FormItem>
            <p className="mb-[6px] text-sm font-semibold">
              <FormLabel
                className="text-sm font-semibold !text-brand-component-text-dark"
                required
              >
                {t('select_entity')}
              </FormLabel>
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={cn(
                    'w-full justify-between rounded-lg bg-brand-fill-dark-soft px-3 duration-200 dark:bg-brand-heading',
                    isError &&
                      'ring-red-600 ring-2 ring-offset-2 bg-brand-component-fill-negative-soft'
                  )}
                  variant="ghost"
                >
                  <div className="flex w-full items-center justify-between text-sm text-brand-component-text-gray">
                    <p className="max-w-[86%] overflow-hidden text-ellipsis whitespace-nowrap">
                      {entityNames || t('select_entity')}
                    </p>
                    <CaretDown />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-[var(--radix-dropdown-menu-trigger-width)] rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-light-fixed shadow-lg dark:bg-brand-heading"
                align="start"
                sideOffset={4}
              >
                {entityList.length > 0 ? (
                  entityList.map((entity) => (
                    <DropdownMenuItem
                      key={entity.id}
                      className="cursor-pointer px-3 py-2 hover:bg-brand-component-fill-dark-soft"
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => handleSelectEntity(entity.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Input
                          type="checkbox"
                          className="size-5 rounded border-brand-component-stroke-dark-soft px-2 peer-checked:bg-brand-component-fill-dark-soft"
                          checked={selectedEntityIds.includes(entity.id)}
                        />
                        <Label className="text-sm text-brand-component-text-dark">
                          {`${entity.unique_key}.${entity.entity_type.unique_key}`}
                        </Label>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem
                    className="cursor-not-allowed px-3 py-2 hover:bg-brand-component-fill-dark-soft"
                    disabled
                  >
                    {t('no_entities_found')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default SwitchSource
