'use client'

import { Drawer, DrawerContent } from '@/components/ui/drawer'
import React, { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import GuidelineDark1 from '/public/images/guideline-dark-1.webp'
import GuidelineDark2 from '/public/images/guideline-dark-2.webp'
import GuidelineDark3 from '/public/images/guideline-dark-3.webp'
import GuidelineLight1 from '/public/images/guideline-light-1.webp'
import GuidelineLight2 from '/public/images/guideline-light-2.webp'
import GuidelineLight3 from '/public/images/guideline-light-3.webp'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { wrap } from 'popmotion'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 150 : -150,
      opacity: 0,
    }
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 150 : -150,
      opacity: 0,
    }
  },
}

const swipeConfidenceThreshold = 10000

const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

export default function Guideline() {
  const [[page, direction], setPage] = useState([0, 0])
  const t = useTranslations('onboarding')
  const [open, setOpen] = useState(true)

  const { theme = 'light' } = useTheme()

  const handleCloseGuideline = useCallback(() => {
    setOpen(false)
  }, [])

  const handleGoToPage = useCallback((page: number) => {
    setPage([page, 0])
  }, [])

  const handleGoToStep = useCallback((page: number) => {
    setPage((prev) => [prev[0] + page, page])
  }, [])

  const steps = [
    {
      label: t('welcome_to_gps_tracking_template'),
      light: GuidelineLight1,
      dark: GuidelineDark1,
    },
    {
      label: t('welcome_to_gps_tracking_template'),
      light: GuidelineLight2,
      dark: GuidelineDark2,
    },
    {
      label: t('welcome_to_gps_tracking_template'),
      light: GuidelineLight3,
      dark: GuidelineDark3,
    },
  ]

  const imageIndex = wrap(0, steps.length, page)

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection])
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <VisuallyHidden>
        <DialogTitle />
      </VisuallyHidden>
      <DrawerContent
        className="h-[95vh] text-brand-text-dark dark:bg-brand-fill-outermost dark:text-white"
        aria-describedby={undefined}
      >
        <div className="flex size-full flex-col overflow-auto">
          <div className="sticky top-0 z-40 flex items-center justify-between border-b border-b-brand-stroke-dark-soft bg-white px-4 pb-4 dark:border-b-brand-stroke-outermost dark:bg-brand-fill-outermost">
            <Button
              onClick={handleCloseGuideline}
              variant="outline"
              size="lg"
              className={cn(
                'visible items-center gap-2 rounded-lg border-brand-stroke-dark-soft text-brand-dark-fill-secondary opacity-100 shadow-none transition-all duration-300 dark:border-brand-stroke-outermost dark:text-white',
                {
                  'invisible opacity-0': imageIndex === 2,
                },
              )}
            >
              {t('skip')}
              <ChevronsRight size={20} />
            </Button>
            <Button
              size="lg"
              className={cn(
                'invisible gap-2 rounded-lg border-4 border-brand-heading bg-brand-fill-outermost opacity-0 shadow-sm transition-all duration-300 dark:border-brand-stroke-outermost',
                {
                  'visible opacity-100': imageIndex === 2,
                },
              )}
              onClick={handleCloseGuideline}
            >
              {t('finish')}
            </Button>
          </div>
          <div className="flex h-full flex-1 flex-col overflow-hidden px-14 py-8">
            <div className="flex flex-col items-center justify-center gap-3 font-semibold leading-6">
              <div className="flex gap-6">
                <Button
                  size="icon"
                  disabled={imageIndex === 0}
                  onClick={() => handleGoToStep(-1)}
                  className={cn(
                    'size-10 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark shadow-sm',
                    {
                      'border-brand-component-stroke-disabled':
                        imageIndex === 0,
                    },
                  )}
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  size="icon"
                  disabled={imageIndex === 2}
                  onClick={() => handleGoToStep(1)}
                  className={cn(
                    'size-10 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark shadow-sm',
                    {
                      'border-brand-component-stroke-disabled':
                        imageIndex === 2,
                    },
                  )}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
              <div>{`${imageIndex + 1}/3`}</div>
              <div className="flex justify-center gap-3">
                {steps.map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      'size-2 rounded-full bg-brand-fill-dark-soft transition-all duration-300',
                      {
                        'bg-brand-dark-fill-secondary': imageIndex === index,
                      },
                    )}
                  />
                ))}
              </div>
              <div className="mb-6">{steps[imageIndex].label}</div>
            </div>
            <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden text-center">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={page}
                  src={steps[imageIndex][theme as 'light' | 'dark'].src}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute h-full object-contain"
                  transition={{
                    x: { type: 'spring', stiffness: 200, damping: 30 },
                    opacity: { duration: 0.3 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(_, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x)
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1)
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1)
                    }
                  }}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
