'use client'
import { ColumnDef } from '@tanstack/table-core'
import { ChevronDown, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Firework } from '@/components/icons/firework'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useSpaceStore } from '@/stores'
import { SearchMember, Option } from './search-member'

interface User {
  id: string
  name: string
  email: string
}

const users: User[] = [
  {
    id: '792f9225-59ca-4655-ab60-9934097b0f55',
    name: 'Pincas Pampling',
    email: 'ppampling0@cafepress.com',
  },
  {
    id: 'ac79dc5d-11ff-47ca-ad5d-77d83509c3e6',
    name: 'Sol Trunby',
    email: 'strunby1@omniture.com',
  },
  {
    id: '834e1c3f-b745-4674-a846-b0099268c173',
    name: 'Ardith Burgyn',
    email: 'aburgyn2@ucoz.ru',
  },
  {
    id: 'c3355f58-81d7-429f-9117-78f154375c8e',
    name: 'Debor Kamenar',
    email: 'dkamenar3@networksolutions.com',
  },
  {
    id: '9b1514d9-a738-46b8-b9f0-4a39fd787246',
    name: 'Sidney Jerke',
    email: 'sjerke4@weebly.com',
  },
  {
    id: '29a5b2d4-5004-4478-9f9f-b0f27be8fd14',
    name: 'Paige Risom',
    email: 'prisom5@seesaa.net',
  },
  {
    id: '8015596a-72e9-48df-ba03-f02b177ea999',
    name: 'Michaelina Cersey',
    email: 'mcersey6@fema.gov',
  },
  {
    id: 'c9c5d765-9c8d-4af2-9b39-358d3e6023a8',
    name: 'Chrysa Bohlsen',
    email: 'cbohlsen7@cdc.gov',
  },
  {
    id: 'c8d6e753-7398-4492-8d82-83a9ae8dd9ca',
    name: 'Cheslie Sawdon',
    email: 'csawdon8@netvibes.com',
  },
  {
    id: '5555bce2-893f-477a-a611-0fb35871f53a',
    name: 'Nettie Rowles',
    email: 'nrowles9@cmu.edu',
  },
]

export default function EnterMember() {
  const t = useTranslations('space')
  const [value, setValue] = useState<Option>()
  const [data, setData] = useState<User[]>([])
  const { setBackPreviousPage, setLoading } = useSpaceStore(
    useShallow((state) => state),
  )

  const handleInvite = () => {
    // @TODO: handle send email invite
    setLoading()
  }

  const handleSkip = () => {
    // @TODO: handle redirect to new space
    setLoading()
  }

  useEffect(() => {
    setBackPreviousPage(data.length > 0)
  }, [data])

  const handleRemoveMember = useCallback((id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-[600px] animate-display-effect flex-col gap-4 pt-4">
      <div>
        <Firework className="mx-auto block" />
        <div className="mt-2 text-center text-brand-text-dark">
          {t(
            'congratulations_youve_created_your_new_space_take_the_next_step_by_inviting_members_to_join_and_collaborate',
          )}
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-1.5">
        <Label className="leading-5 text-brand-text-dark">
          {t('invite_member_by_email_comma_separated')}
        </Label>
        <SearchMember
          options={users.map((item) => ({
            label: item.name,
            email: item.email,
            value: item.id,
          }))}
          emptyMessage="No resulsts."
          placeholder="Find something"
          onValueChange={(value) => {
            setValue(value)
            setData((prev) => {
              const existingIds = new Set(prev.map((item) => item.id))
              const isExist = existingIds.has(value.value)
              if (isExist) {
                return prev.filter((item) => item.id !== value.value)
              }
              const user = users.find((item) => item.id === value.value) || {
                id: value.value,
                name: value.label,
                email: value.email,
              }
              return [...prev, user]
            })
          }}
          value={value}
        />
      </div>
      <DataTable columns={useColumns({ handleRemoveMember })} data={data} />
      <div className="flex gap-2.5">
        <Button
          className="h-12 flex-1 rounded-lg border-brand-stroke-dark-soft text-brand-text-gray shadow-none"
          variant="outline"
          onClick={handleSkip}
        >
          {t('ill_do_it_later')}
        </Button>
        <Button
          className="h-12 flex-1 rounded-lg border-brand-stroke-dark-soft shadow-none"
          onClick={handleInvite}
        >
          {t('invite')}
        </Button>
      </div>
    </div>
  )
}

interface ColumnProps {
  handleRemoveMember: (id: string) => void
}

export const useColumns = (props: ColumnProps): ColumnDef<User>[] => {
  const t = useTranslations('space')
  const { handleRemoveMember } = props

  return [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row: { original } }) => {
        return (
          <div className="flex items-center gap-2 text-xs text-brand-text-gray">
            <Avatar className="flex size-6 items-center justify-center rounded">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {original.name}
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: t('role'),
      cell: () => (
        <Select>
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
              <SelectItem value="apple">Viewer</SelectItem>
              <SelectItem value="banana">Editor</SelectItem>
              <SelectItem value="blueberry">Admin</SelectItem>
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
          onClick={() => handleRemoveMember(original.id)}
        >
          <Trash size={16} />
        </Button>
      ),
    },
  ]
}
