'use client'

import { DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import { CirclePlus } from 'lucide-react'
import React from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AutoComplete } from '@/components/ui/auto-complete'
import { ColumnDef } from '@tanstack/table-core'
import { DataTable } from '@/components/ui/data-table'

const formSchema = z.object({
  spaceName: z
    .string()
    .min(2, { message: 'The Space Name must be at least 2 characters.' })
    .max(100, { message: 'The Space Name meets specified character limits' }),
})

interface User {
  id: string
  name: string
  email: string
}

const users: User[] = [
  {
    id: '1',
    name: 'Jonhny 1',
    email: 'bessie213@df.com',
  },
  {
    id: '2',
    name: 'Jonhny 2',
    email: 'bessie213@df.com',
  },
  {
    id: '3',
    name: 'Jonhny 3',
    email: 'bessie213@df.com',
  },
  {
    id: '4',
    name: 'Jonhny 4',
    email: 'bessie213@df.com',
  },
  {
    id: '5',
    name: 'Jonhny 5',
    email: 'bessie213@df.com',
  },
]

const AddNewSpace = () => {
  const [searchValue, setSearchValue] = React.useState<string>('')
  const [selectedValue, setSelectedValue] = React.useState<string>('')

  const t = useTranslations('addNewSpace')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <>
      <Dialog open>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="flex items-center gap-2">
              <CirclePlus size={20} />
              {t('add_new_space')}
            </div>
            <DropdownMenuShortcut>⌘⌥N</DropdownMenuShortcut>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[488px]">
          <DialogHeader className="border-none">
            <DialogTitle>{t('add_new_space')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-4 pb-4"
            >
              <FormField
                control={form.control}
                name="spaceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-brand-text-dark dark:text-white">
                      {t('space_name')}
                      <span className="text-brand-semantic-accent">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="border-0 shadow-none focus-visible:ring-0"
                        placeholder={t('space_name')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-1.5">
                <FormLabel className="font-semibold text-brand-text-dark dark:text-white">
                  {t('invite_member_by_email_comma_separated')}
                </FormLabel>
                <AutoComplete
                  selectedValue={selectedValue}
                  onSelectedValueChange={setSelectedValue}
                  searchValue={searchValue}
                  onSearchValueChange={setSearchValue}
                  items={
                    users.map((item) => ({
                      label: item.name,
                      value: item.id,
                    })) ?? []
                  }
                  isLoading={false}
                  emptyMessage="No pokemon found."
                />
              </div>
              <DataTable columns={columns()} data={users} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t('cancel')}
                  </Button>
                </DialogClose>
                <Button type="submit">{t('create_space')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const columns = (): ColumnDef<User>[] => {
  const t = useTranslations('addNewSpace')
  return [
    {
      accessorKey: 'name',
      header: t('name'),
    },
    {
      accessorKey: 'email',
      header: t('role'),
    },
    {
      accessorKey: 'amount',
      header: t('action'),
    },
  ]
}

export default AddNewSpace
