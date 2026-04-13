'use client'

import { useOrganizationValidationStore } from '@/stores/organization-validation-store'
import type { OrganizationValidationSnapshot } from '@/stores/organization-validation-store'
import { useLayoutEffect, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'

export function OrganizationValidationHydration({
  children,
  value,
}: {
  children: ReactNode
  value: OrganizationValidationSnapshot
}) {
  const { setOrganizationValidation, resetOrganizationValidation } =
    useOrganizationValidationStore(
      useShallow((s) => ({
        setOrganizationValidation: s.setOrganizationValidation,
        resetOrganizationValidation: s.resetOrganizationValidation,
      }))
    )

  useLayoutEffect(() => {
    setOrganizationValidation(value)
    return () => resetOrganizationValidation()
  }, [value])

  return <>{children}</>
}
