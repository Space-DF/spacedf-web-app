'use client'
import { Player } from '@lottiefiles/react-lottie-player'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
const invitationAcceptedAnimation = '/animations/invitation-accepted.json'
const invitationRejectedAnimation = '/animations/invitation-failed.json'

export default function InvitationPage() {
  const searchParams = useSearchParams()
  const t = useTranslations('common')
  const isInvitationAccepted = searchParams.get('status') === 'success'
  return (
    <div className="w-screen h-screen flex justify-center items-center gap-4">
      <div className="flex flex-col gap-4">
        {isInvitationAccepted ? (
          <>
            <Player
              autoplay
              loop
              src={invitationAcceptedAnimation}
              className="w-80"
            />
            <h1 className="text-4xl font-semibold text-center">
              {t('invitation_accepted')}
            </h1>
            <p className="text-center text-sm text-gray-500">
              {t('invitation_accepted_description')}
            </p>
            <div className="flex justify-center">
              <Link href={`/`}>
                <Button className="w-fit">{t('continue_to_dashboard')}</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <Player
              autoplay
              loop
              src={invitationRejectedAnimation}
              className="w-80"
            />
            <h1 className="text-4xl font-semibold text-center">
              {t('invitation_failed')}
            </h1>
            <p className="text-center text-sm text-gray-500">
              {t('invitation_failed_description')}
            </p>
            <div className="flex justify-center">
              <Link href={`/`}>
                <Button className="w-fit">{t('back_to_login')}</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
