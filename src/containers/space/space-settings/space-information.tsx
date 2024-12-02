import { ChevronDown, Trash, UploadCloud } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import ImageWithBlur from '@/components/ui/image-blur'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import OrganizationThumb from '/public/images/organization-thumb.svg'
import { Textarea } from '@/components/ui/textarea'
import { useSpaceSettings } from '@/stores/space-settings-store'
import { useRouter } from '@/i18n/routing'
import { Label } from '@/components/ui/label'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Option, SearchMember } from './search-member'
import { DataTable } from '@/components/ui/data-table'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ColumnDef } from '@tanstack/react-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Space } from '@/types/space'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'

const formSchema = z.object({
  space_name: z
    .string()
    .min(1, {
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
  created_at: z
    .string()
    .min(1, {
      message: 'This field cannot be empty',
    })
    .max(50, {
      message: 'This field must be less than or equal to 50 characters',
    }),
  owner: z.string(),
  space_member: z.string(),
  description: z.string().optional(),
})

export function InformationTab({ space }: { space: Space }) {
  const t = useTranslations('space')
  const { setStep } = useSpaceSettings()
  const { setShouldBackToHome, setOpenAlertDialog } = useSpaceSettings()
  const router = useRouter()
  const params = useParams()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      space_name: space?.name,
      created_at: dayjs(space?.created_at).format('YYYY/MM/DD'),
      owner: 'Digital Fortress',
      space_member: '10',
      description: '',
    },
  })
  const { isDirty } = form.formState

  useEffect(() => {
    setShouldBackToHome(isDirty)
  }, [isDirty])

  const handleCancel = () => {
    if (isDirty) {
      setOpenAlertDialog(true)
      return
    }
    router.push(`/spaces/${params.spaceSlug}`)
  }

  function onSubmit() {}

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <Form {...form}>
        <form
          className="flex w-full flex-1 flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-3">
            <FormLabel className="text-brand-component-text-dark">
              {t('space_image')}
            </FormLabel>
            <div className="flex gap-3">
              <div className="size-24 rounded-lg border border-brand-component-stroke-dark-soft">
                <ImageWithBlur
                  src={space.logo || OrganizationThumb}
                  className="size-full rounded-lg object-cover"
                  alt=""
                  width={96}
                  height={96}
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-lg text-base font-semibold text-brand-component-text-dark shadow-none"
                >
                  {t('upload_image')}
                  <UploadCloud size={20} className="-scale-x-100" />
                </Button>
                <p className="text-xs text-brand-component-text-gray">
                  {t('800x800_png_jpg_is_recommended_maximum_file_size_5mb')}
                </p>
              </div>
            </div>
          </div>
          <FormField
            control={form.control}
            name="space_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brand-component-text-dark">
                  {t('space_name')}
                  <span className="text-brand-component-text-negative">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('space_name')}
                    className="h-10 border-0 shadow-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="created_at"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-brand-component-text-dark">
                    {t('creation_date')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      className="h-10 border-0 shadow-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-brand-component-text-dark">
                    {t('owner_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      className="h-10 border-0 shadow-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="space_member"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-brand-component-text-dark">
                    {t('space_member')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      className="h-10 border-0 shadow-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brand-component-text-gray">
                  {t('description_of_the_space')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('enter_the_description')}
                    className="resize-none border-0 shadow-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2.5">
            <Button
              onClick={handleCancel}
              type="button"
              className="h-12 flex-1 rounded-lg border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none hover:text-brand-component-text-gray-hover dark:bg-transparent"
              variant="outline"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="h-12 flex-1 items-center rounded-lg border-4 border-brand-component-stroke-dark bg-brand-component-fill-dark text-base font-medium text-brand-component-text-light-fixed shadow-sm dark:border-brand-component-stroke-light dark:bg-brand-component-fill-secondary"
            >
              {t('save_changes')}
            </Button>
          </div>
        </form>
      </Form>
      <div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setStep('delete')}
          className="gap-2 border-brand-component-stroke-negative bg-transparent text-sm font-semibold text-brand-component-text-negative hover:bg-transparent hover:text-brand-component-text-negative-hover"
        >
          <Trash size={20} />
          {t('delete_space')}
        </Button>
      </div>
    </div>
  )
}

interface User {
  id: string
  name: string
  email: string
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
          <div className="flex items-center gap-2">
            <Avatar className="flex size-6 items-center justify-center rounded">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold text-brand-component-text-dark">
                {original.name}
              </div>
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

const usersData: User[] = [
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

export function MemberTab({ space }: { space: Space }) {
  const t = useTranslations('space')
  const [deleteId, setDeleteId] = useState<string | undefined>()
  const [data, setData] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>(usersData)

  const handleRemoveMember = useCallback(
    (id: string, shouldConfirm = false) => {
      if (shouldConfirm) {
        setDeleteId(id)
        return
      }
      setData((prev) => prev.filter((item) => item.id !== id))
    },
    [],
  )

  const handleDelete = () => {
    setDeleteId(undefined)
    setUsers((prev) => prev.filter((item) => item.id !== deleteId))
  }

  return (
    <div className="p-4">
      <div className="mb-3 space-y-2">
        <Label className="text-sm font-semibold text-brand-component-text-dark">
          {t('invite_list')}
        </Label>
        <div className="flex items-end gap-3 rounded-lg border border-brand-component-stroke-dark-soft p-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label className="text-sm font-semibold text-brand-component-text-dark">
              {t('invite_member_by_email')}
            </Label>
            <SearchMember
              options={usersData as Option[]}
              selectedItems={data.map((item) => item.id)}
              placeholder="Invite member by Email"
              onValueChange={(values) => {
                setData((prev) => {
                  const removedItems = prev.filter(
                    ({ email: oldEmail }) =>
                      !values.some(({ email }) => oldEmail === email),
                  )

                  const addedItems = values.filter(
                    ({ email: newEmail }) =>
                      !prev.some(({ email }) => email === newEmail),
                  )

                  return [...removedItems, ...addedItems].map((item) => {
                    const userExists = usersData.find(
                      ({ email }) => item.email === email,
                    )
                    return userExists || item
                  })
                })
              }}
            />
          </div>
          <div>
            <Button
              className="gap-2 rounded-lg border-t-2 border-brand-heading bg-brand-fill-outermost shadow-button transition-all duration-300 dark:border-brand-stroke-outermost"
              size="lg"
            >
              {t('invite')}
            </Button>
          </div>
        </div>
      </div>
      <DataTable columns={useColumns({ handleRemoveMember })} data={data} />
      <Separator className="my-4" />
      <DataTable
        columns={useColumns({
          handleRemoveMember: (id) => handleRemoveMember(id, true),
        })}
        data={users}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(undefined)}
      >
        <AlertDialogContent className="sm:max-w-md sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center font-bold text-brand-text-dark">
              {t('delete_member')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-medium text-center text-sm text-brand-text-gray">
              {t('are_you_sure_you_want_to_delete_this_member')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 flex-1 text-brand-text-gray">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-12 flex-1 border-2 border-brand-semantic-accent-dark bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
