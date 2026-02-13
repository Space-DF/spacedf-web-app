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
import { InviteMember } from '@/types/members'
import { ChevronDown, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { ColumnProps } from '../index'

export const useInviteColumns = (
  props: ColumnProps
): ColumnDef<InviteMember>[] => {
  const t = useTranslations('space')
  const { onRemoveMember, spaceRoles, onChangeMemberRole } = props

  return [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row: { original } }) => {
        return (
          <div className="flex items-center gap-2">
            <Avatar className="flex size-6 items-center justify-center rounded">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xs font-medium text-brand-component-text-gray">
                {original.email}
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
          value={(original as InviteMember).space_role_id || spaceRoles[0].id}
          onValueChange={(value) => onChangeMemberRole(original.email, value)}
        >
          <SelectTrigger
            className="w-20 border-0 px-0 text-sm shadow-none focus:ring-0"
            icon={
              <ChevronDown className="size-6 opacity-50" strokeWidth="1.5" />
            }
          >
            <SelectValue />
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
      accessorKey: 'amount',
      header: t('action'),
      cell: ({ row: { original } }) => (
        <Button
          size="icon"
          variant="outline"
          className="size-8 border-brand-stroke-dark-soft text-brand-text-gray shadow-none"
          onClick={() => onRemoveMember(original.email)}
        >
          <Trash size={16} />
        </Button>
      ),
    },
  ]
}
