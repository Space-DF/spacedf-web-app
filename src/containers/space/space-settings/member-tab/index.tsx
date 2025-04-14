import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { InputWithIcon } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
import { DataTable } from '@/components/ui/data-table'
import { Separator } from '@/components/ui/separator'
import { Space, SpaceRole } from '@/types/space'
import { Option, SearchMember } from '../search-member'
import { useSpaceRoles } from '../hooks/useSpaceRoles'
import { useInviteSpaceMembers } from '../hooks/useInviteSpaceMembers'
import { InviteMember } from '@/types/members'
import { useSpaceMembers } from '../hooks/useSpaceMembers'
import { useInviteColumns } from './hooks/useInviteColumns'
import { useMemberColumns } from './hooks/useMemberColumns'
import { useRemoveSpaceMember } from '../hooks/useRemoveSpaceMember'
import { useUpdateRoleMember } from '../hooks/useUpdateRoleMember'
import { toast } from 'sonner'
import { PaginationState } from '@tanstack/react-table'
import { ApiDataTable } from '@/components/ui/api-data-table'
import { useDebounce } from '@/hooks/useDebounce'
export interface ColumnProps {
  onRemoveMember: (id: string) => void
  spaceRoles: SpaceRole[]
  onChangeMemberRole: (email: string, role: string) => void
  isLoading?: boolean
}

const DEFAULT_PAGE_SIZE = 10

const INITIAL_PAGINATION_STATE = {
  pageIndex: 0,
  pageSize: DEFAULT_PAGE_SIZE,
}

export function MemberTab({}: { space: Space }) {
  const t = useTranslations()
  const [deleteId, setDeleteId] = useState<string | undefined>()
  const [inviteMembers, setInviteMembers] = useState<InviteMember[]>([])
  const { trigger: inviteSpaceMembers, isMutating } = useInviteSpaceMembers()
  const { data } = useSpaceRoles()
  const spaceRoles = data?.results || []
  const [paginatedState, setPaginatedState] = useState<PaginationState>(
    INITIAL_PAGINATION_STATE
  )
  const [searchMember, setSearchMember] = useState('')

  const searchMemberDebounced = useDebounce(searchMember, 500)
  const {
    data: paginatedMembers,
    isLoading: isLoadingMembers,
    mutate: mutateMembers,
  } = useSpaceMembers(
    paginatedState.pageIndex,
    paginatedState.pageSize,
    searchMemberDebounced
  )

  const { trigger: removeSpaceMember, isMutating: isRemoving } =
    useRemoveSpaceMember()

  const { trigger: updateRoleMember } = useUpdateRoleMember()

  const sortedMembers = useMemo(() => {
    return isLoadingMembers
      ? Array(10).fill({})
      : (paginatedMembers?.results || []).sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        })
  }, [isLoadingMembers, paginatedMembers])

  const totalPages = useMemo(() => {
    return Math.ceil((paginatedMembers?.count || 0) / DEFAULT_PAGE_SIZE)
  }, [paginatedMembers])

  const onRemoveInviteMember = useCallback((email: string) => {
    setInviteMembers((prev) => prev.filter((item) => item.email !== email))
  }, [])

  const onRemoveMember = useCallback((id: string) => {
    setDeleteId(id)
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    await removeSpaceMember(deleteId)
    mutateMembers()
    setPaginatedState(INITIAL_PAGINATION_STATE)
    setDeleteId(undefined)
  }

  const handleClearAll = () => {
    setInviteMembers([])
  }

  const handleInviteAll = async () => {
    await inviteSpaceMembers(inviteMembers)
    handleClearAll()
  }

  const onMemberChange = useCallback(
    (values: Option[]) => {
      setInviteMembers((prev) => {
        const prevMembersMap = new Map(
          prev.map((member) => [member.email, member])
        )
        const newMembersMap = new Map(
          values.map((member) => [member.email, member])
        )

        const removedMembers = prev.filter(
          (member) => !newMembersMap.has(member.email)
        )
        const addedMembers = values
          .filter((member) => !prevMembersMap.has(member.email))
          .map((member) => ({
            ...member,
            space_role_id: spaceRoles[0].id,
          }))

        return [...removedMembers, ...addedMembers]
      })
    },
    [spaceRoles]
  )

  const onChangeInviteMemberRole = useCallback(
    (email: string, role: string) => {
      setInviteMembers((prev) =>
        prev.map((member) =>
          member.email === email ? { ...member, space_role_id: role } : member
        )
      )
    },
    []
  )

  const onChangeMemberRole = useCallback(
    async (id: string, role: string) => {
      toast.promise(updateRoleMember({ id, space_role: role }), {
        loading: t('space.updating_role'),
        success: () => {
          mutateMembers()
          return t('space.member_updated_successfully')
        },
        error: () => {
          return t('space.failed_to_update_member')
        },
      })
    },
    [updateRoleMember, mutateMembers]
  )

  const onPaginationChange = useCallback(
    (
      updaterOrValue:
        | PaginationState
        | ((old: PaginationState) => PaginationState)
    ) => {
      const newPagination =
        typeof updaterOrValue === 'function'
          ? updaterOrValue({
              pageIndex: paginatedState.pageIndex,
              pageSize: DEFAULT_PAGE_SIZE,
            })
          : updaterOrValue
      setPaginatedState(newPagination)
    },
    [paginatedState]
  )
  return (
    <div className="p-4 space-y-3">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-brand-component-text-dark">
          {t('space.invite_list')}
        </Label>
      </div>
      <div className="rounded-lg border border-brand-component-stroke-dark-soft p-3 space-y-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label className="text-sm font-semibold text-brand-component-text-dark">
            {t('space.invite_member_by_email')}
          </Label>
          <SearchMember
            selectedItems={inviteMembers.map((item) => item.email)}
            placeholder={t('space.invite_member_by_email')}
            onValueChange={onMemberChange}
          />
        </div>
        <DataTable
          columns={useInviteColumns({
            onRemoveMember: onRemoveInviteMember,
            spaceRoles,
            onChangeMemberRole: onChangeInviteMemberRole,
          })}
          showPaginate={false}
          data={inviteMembers}
        />
        <div className="flex justify-end">
          <div className="grid grid-cols-2 gap-2 w-48">
            <Button
              variant="outline"
              className="h-10 w-full"
              disabled={inviteMembers.length === 0}
              onClick={handleClearAll}
            >
              {t('space.clear_all')}
            </Button>
            <Button
              className="h-10 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark text-base font-semibold text-white shadow-sm dark:border-brand-component-stroke-light"
              size="lg"
              disabled={inviteMembers.length === 0}
              onClick={handleInviteAll}
              loading={isMutating}
            >
              {t('space.invite_all')}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-4" />
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-brand-component-text-dark">
          {t('space.space_members')}
        </div>
        <div>
          <InputWithIcon
            prefixCpn={<Search size={18} />}
            placeholder={t('common.search')}
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
          />
        </div>
      </div>
      <ApiDataTable
        columns={useMemberColumns({
          onRemoveMember,
          spaceRoles,
          onChangeMemberRole,
          isLoading: isLoadingMembers,
        })}
        data={sortedMembers}
        pageCount={totalPages}
        pagination={paginatedState}
        onPaginationChange={onPaginationChange}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(undefined)}
      >
        <AlertDialogContent className="sm:max-w-md sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center font-bold text-brand-text-dark">
              {t('space.delete_member')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-medium text-center text-sm text-brand-text-gray">
              {t('space.are_you_sure_you_want_to_delete_this_member')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 flex-1 text-brand-text-gray">
              {t('space.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleDelete}
                loading={isRemoving}
                className="h-12 flex-1 border-2 border-brand-semantic-accent-dark bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('space.delete')}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
