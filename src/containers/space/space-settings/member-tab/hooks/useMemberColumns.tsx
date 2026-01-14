import {
  Select,
  SelectGroup,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ColumnDef } from '@tanstack/react-table'

import { useTranslations } from 'next-intl'

import { SelectItem } from '@/components/ui/select'
import { ChevronDown, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { ColumnProps } from '../index'
import { Member } from '@/types/members'
import { Skeleton } from '@/components/ui/skeleton'
export const useMemberColumns = (props: ColumnProps): ColumnDef<Member>[] => {
  const t = useTranslations('space')
  const { onRemoveMember, spaceRoles, onChangeMemberRole, isLoading } = props
  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: 'name',
      header: t('member_account'),
      cell: ({ row: { original } }) => {
        return (
          <div className="flex items-center gap-2">
            <Avatar className="flex size-6 items-center justify-center rounded">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold text-brand-component-text-dark">
                {original.organization_user.first_name}
              </div>
              <div className="text-xs font-medium text-brand-component-text-gray">
                {original.organization_user.email}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: t('role'),
      cell: ({ row: { original } }) => (
        <Select
          value={original.space_role.id || spaceRoles[0].id}
          onValueChange={(value) => onChangeMemberRole(original.id, value)}
        >
          <SelectTrigger
            className="w-20 border-0 px-0 text-sm shadow-none focus:ring-0"
            icon={
              <ChevronDown className="size-6 opacity-50" strokeWidth="1.5" />
            }
          >
            <SelectValue placeholder="Viewer" />
          </SelectTrigger>
          <SelectContent className="text-sm">
            <SelectGroup>
              {spaceRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: 'action',
      header: t('action'),
      cell: ({ row: { original } }) => (
        <Button
          size="icon"
          variant="outline"
          className="size-8 border-brand-stroke-dark-soft text-brand-text-gray shadow-none"
          onClick={() => onRemoveMember(original.id)}
          disabled={original.organization_user.is_owner}
        >
          <Trash size={16} />
        </Button>
      ),
    },
  ]

  return isLoading
    ? columns.map((column) => ({
        ...column,
        cell: () => <Skeleton className="h-4 w-20" />,
      }))
    : columns
}
