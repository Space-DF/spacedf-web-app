import React, { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { dataTablePayload, Device } from '@/validator'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormLabel } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { useDeviceEntity } from '../../../hooks/useDeviceEntity'

const getEntityNames = (entities: Device[]) => {
  return entities.map((entity) => entity.entity_name).join(', ')
}

const Source: React.FC = () => {
  const t = useTranslations('dashboard')
  const form = useFormContext<dataTablePayload>()
  const { setValue, watch } = form
  const selectedEntities = watch('source.entities') || []

  const toggleDevice = (entity: Device) => {
    const isSelected = selectedEntities.some(
      (e) => e.entity_id === entity.entity_id
    )
    const updatedEntities = isSelected
      ? selectedEntities.filter((e) => e.entity_id !== entity.entity_id)
      : [...selectedEntities, entity]

    setValue('source.entities', updatedEntities)
  }

  const { data: entities } = useDeviceEntity('table')
  const entityList = entities?.results || []

  const entityNames = useMemo(
    () => getEntityNames(selectedEntities),
    [selectedEntities]
  )

  return (
    <div className="mt-4 size-full px-4">
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
            className="w-full justify-between rounded-lg bg-brand-fill-dark-soft px-3 duration-200 dark:bg-brand-heading"
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
          {entityList.map((entity) => (
            <DropdownMenuItem
              key={entity.id}
              className="cursor-pointer px-3 py-2 hover:bg-brand-component-fill-dark-soft"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-3">
                <Input
                  type="checkbox"
                  className="size-5 rounded border-brand-component-stroke-dark-soft px-2 peer-checked:bg-brand-component-fill-dark-soft"
                  checked={selectedEntities.some(
                    (e) => e.entity_id === entity.id
                  )}
                  onChange={() =>
                    toggleDevice({
                      entity_id: entity.id,
                      entity_name: entity.name,
                    })
                  }
                  isError={!!form.formState.errors.source?.entities}
                />
                <Label className="text-sm text-brand-component-text-dark">
                  {`${entity.unique_key}.${entity.entity_type.unique_key}`}
                </Label>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Source
