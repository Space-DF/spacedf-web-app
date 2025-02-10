'use client'

import { SpaceDFLogoFull } from '@/components/icons'
import React, { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { InputWithIcon } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Check, Mail } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { wrap } from 'popmotion'
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern'
import { FavIcon } from '@/components/icons/fav-icon'
import Image from 'next/image'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const formSchema = z.object({
  email: z
    .string()
    .email()
    .refine(
      (email) => {
        const [localPart] = email.split('@')
        return localPart.length <= 64
      },
      {
        message: 'The local part of the email must not exceed 64 characters.',
      }
    )
    .refine(
      (email) => {
        const [, domain = ''] = email.split('@')
        return domain.length <= 255
      },
      {
        message: 'The domain part of the email must not exceed 255 characters.',
      }
    )
    .refine((email) => email.length <= 320, {
      message: 'The total email length must not exceed 320 characters.',
    }),
})

const videoUrls = [
  'https://kinhdev24.github.io/df-landing-video/FullVideo2K%202.mp4',
  'https://kinhdev24.github.io/df-landing-video/Tab2Video2K.mp4',
  'https://kinhdev24.github.io/df-landing-video/Tab3Video2K.mp4',
]

const variants = {
  enter: {
    y: 10,
    opacity: 0,
    duration: 0.5,
  },
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
    duration: 0.5,
  },
  exit: {
    zIndex: 0,
    y: 10,
    opacity: 0,
    duration: 0.5,
  },
}

export default function LandingPage() {
  const t = useTranslations('landingPage')
  const [visible, setVisible] = useState<boolean>(true)
  const waitlistRef = useRef<HTMLDivElement>(null)
  const [[page, direction], setPage] = useState([0, 0])
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const textSteps = [
    t('universal_device_connectivity'),
    t('digital_twins_tailored_to_your_needs'),
    t('tailored_dashboard_experience'),
  ]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const fetchPromise = fetch('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify(values),
    }).then(async (response) => {
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong')
      }
      setOpenDialog(true)
      form.reset()
      return result
    })
    toast.promise(fetchPromise, {
      loading: 'Join the waiting list...',
      error: (err) => {
        return err.message
      },
    })
  }

  const handleGoToStep = useCallback((page: number) => {
    setPage([page, page])
  }, [])

  const imageIndex = wrap(0, videoUrls.length, page)

  const handleScrollToWaitlist = () => {
    if (waitlistRef && waitlistRef.current) {
      waitlistRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="bg-black min-h-screen">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1, zIndex: 10 }}
            exit={{ opacity: 0, y: -350, transition: { duration: 0.4 } }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => {
              setTimeout(() => {
                setVisible(false)
              }, 500)
            }}
            className="fixed inset-0 flex flex-col justify-center items-center text-[56px] leading-[72px] -tracking-[0.02em] txt-gradiant font-bold"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #FFFFFF 0%, #D0D0D0 56.54%, #6B6B6B 115.38%)',
              marginTop: 121,
            }}
          >
            <div>Welcome to</div>
            <div>SpaceDF</div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="flex items-center justify-between px-10 py-3.5 relative z-10"
      >
        <div>
          <SpaceDFLogoFull className="text-white" />
        </div>
        <nav>
          <ul className="flex border rounded-[28px] bg-[#171A28] border-[#242A46]">
            <li className="text-white py-1 px-5 text-lg cursor-pointer">
              <span onClick={handleScrollToWaitlist}>
                {t('join_the_waitlist')}
              </span>
            </li>
            <li className="text-white py-1 px-5 text-lg cursor-pointer">
              <a
                href="https://discord.gg/YCkZcwcf"
                target="_blank"
                rel="noreferrer nofollow"
              >
                {t('join_our_discord')}
              </a>
            </li>
            <li className="text-white py-1 px-5 text-lg cursor-pointer">
              <a
                href="https://join.slack.com/t/spacedf/shared_invite/zt-2y4qtasl1-1hydHgwlpG2~bqVo2kVUHA"
                target="_blank"
                rel="noreferrer nofollow"
              >
                {t('join_our_slack')}
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex gap-3 items-center">
          <Button
            variant="link"
            asChild
            className="uppercase text-white text-xs font-semibold"
          >
            <Link href="/auth/sign-in">{t('sign_in')}</Link>
          </Button>
          <div
            className="rounded-lg p-px overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(76.06deg, #6E4AFF 0%, #A78BF6 100.07%)',
            }}
          >
            <div className="p-1 bg-black relative z-10 rounded-lg">
              <Button
                variant="link"
                asChild
                className="uppercase text-white text-xs font-semibold h-8 rounded"
                style={{
                  backgroundImage:
                    'linear-gradient(76.06deg, #6E4AFF 0%, #A78BF6 100.07%)',
                }}
              >
                <Link href="/auth/sign-up">{t('sign_up')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>
      <video
        className="block w-full object-cover outline-0 bg-transparent absolute inset-x-0 top-40"
        autoPlay
        loop
        muted
        playsInline
      >
        <source
          src="https://kinhdev24.github.io/df-landing-video/Flowing%2BNeon%2BCurve%2BLines_1.mp4"
          type="video/mp4"
        />
      </video>
      <motion.div
        initial={{ y: 400, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="text-[56px] leading-[72px] -tracking-[0.02em] txt-gradiant font-bold text-center mt-4 relative z-10"
        style={{
          backgroundImage:
            'linear-gradient(180deg, #FFFFFF 0%, #D0D0D0 56.54%, #6B6B6B 115.38%)',
        }}
      >
        <div>{t('spacedf_iot_platform')}</div>
        <div>{t('easily_manage_your_iot_business')}</div>
      </motion.div>
      <div className="overflow-x-hidden">
        <InteractiveGridPattern
          className="[mask-image:radial-gradient(400px_circle_at_center,white,transparent)] top-0"
          width={50}
          height={50}
          squares={[80, 80]}
          squaresClassName="hover:fill-blue-500"
        />
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="my-10 flex justify-center gap-4 relative z-20"
        >
          {textSteps.map((item, index) => (
            <Button
              className={cn(
                'text-lg font-medium text-white border h-11 transition-all duration-300',
                {
                  'border-brand-component-text-secondary border-2':
                    index === imageIndex,
                  'button-introduction': index !== imageIndex,
                }
              )}
              style={{
                backgroundImage:
                  'linear-gradient(91.33deg, #171A28 -0.68%, #2A2E44 100.17%)',
                boxShadow: '0px 4px 12px 0px #171A2840',
              }}
              key={item}
              onClick={() => handleGoToStep(index)}
            >
              {item}
            </Button>
          ))}
        </motion.div>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="px-12 relative z-10 aspect-video"
        >
          <Image
            src="/IllustrationBorder.webp"
            alt="background landing page"
            width={1000}
            height={1000}
            className="absolute h-full w-[102%] max-w-none -left-3.5 -top-[100px] select-none"
          />
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              className="absolute inset-0 px-[120px]"
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                y: { type: 'spring', stiffness: 200, damping: 30 },
                opacity: { duration: 0.4 },
              }}
            >
              <video
                className="block h-auto object-cover outline-0 bg-transparent rounded-[26px]"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src={videoUrls[imageIndex]} type="video/mp4" />
              </video>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="p-32 flex flex-col items-center gap-16 bg-bottom bg-no-repeat bg-contain"
        style={{ backgroundImage: 'url(/landing-page-bg-footer.webp)' }}
      >
        <div className="flex flex-col items-center gap-10" ref={waitlistRef}>
          <div
            className="text-[56px] leading-[72px] -tracking-[0.02em] txt-gradiant font-bold"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #FFFFFF 0%, #D0D0D0 56.54%, #6B6B6B 115.38%)',
            }}
          >
            {t('join_the_waitlist_for_the')}
          </div>
          <div className="text-[86px] leading-[72px] -tracking-[0.02em] text-gradiant font-bold flex gap-5 items-center">
            <FavIcon className="text-white" />
            SPACEDF
          </div>
        </div>
        <div className="bg-[#050505]/60 rounded-[15px] form-waitlist backdrop-blur-[100px] p-8 flex flex-col items-center gap-3 w-full max-w-[500px]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex gap-3 w-full"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <InputWithIcon
                        prefixCpn={<Mail size={16} />}
                        placeholder={t('email_address')}
                        className="bg-[#090C18] border-brand-component-stroke-dark-soft text-brand-component-text-gray h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                style={{
                  backgroundImage:
                    'linear-gradient(76.06deg, #6E4AFF 0%, #A78BF6 100.07%)',
                }}
                className="font-semibold text-[16px] h-12 border-brand-component-stroke-secondary border-2"
              >
                {t('join_waitlist')}
              </Button>
            </form>
          </Form>
          <div className="text-brand-component-text-gray text-[16px]">
            {t('leave_your_email_to_be_the_first_to_hear_from_us')}
          </div>
        </div>
      </motion.div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent
          className="sm:max-w-[410px] bg-[#090C18] border-brand-component-text-gray-hover dark:border-brand-component-stroke-dark-soft"
          aria-describedby={undefined}
          closeClassName="p-0.5 data-[state=open]:bg-brand-component-hover-dark-light bg-brand-component-hover-dark-light rounded-full"
          iconClassName="size-3.5"
        >
          <VisuallyHidden>
            <DialogTitle />
          </VisuallyHidden>
          <div className="p-6 text-center">
            <div
              className="rounded-full inline-flex p-5"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 57.73%)',
              }}
            >
              <div
                className="rounded-full inline-flex p-3.5"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 57.73%)',
                }}
              >
                <div
                  className="rounded-full size-[52px] flex items-center justify-center text-white"
                  style={{
                    background:
                      'linear-gradient(180deg, #08B94E 0%, #07632B 100%)',
                  }}
                >
                  <Check size={32} className="text-[#090C18]" />
                </div>
              </div>
            </div>
            <div className="text-white text-2xl text-center px-5">{`We’ve added you to our waiting list!`}</div>
            <div className="text-brand-component-text-gray text-[14px] mt-2">{`We’ll keep you updated on the launch of SpaceDF`}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
