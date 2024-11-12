'use client'

import { Drawer, DrawerContent } from '@/components/ui/drawer'
import React, { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import Guideline1 from '/public/images/guideline-1.png'
import Guideline2 from '/public/images/guideline-2.png'
import Guideline3 from '/public/images/guideline-3.png'
import { cn } from '@/lib/utils'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'
import { ChevronsRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { wrap } from 'popmotion'

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
  const [open, setOpen] = useState(true)
  const { setOpenDrawerIdentity } = useIdentityStore(
    useShallow((state) => state),
  )

  const handleNextPage = () => {
    paginate(1)
    if (page === 2) {
      handleGoToSignIn()
    }
  }

  const handleGoToSignIn = useCallback(() => {
    setOpen(false)
    setOpenDrawerIdentity(true)
  }, [])

  const handleGoToPage = useCallback((page: number) => {
    setPage([page, 0])
  }, [])

  const steps = [
    {
      label: 'Welcome to GPS Tracking Template ',
      src: Guideline1,
    },
    {
      label: 'Welcome to GPS Tracking Template ',
      src: Guideline2,
    },
    {
      label: 'Welcome to GPS Tracking Template ',
      src: Guideline3,
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
              onClick={handleGoToSignIn}
              variant="outline"
              size="lg"
              className="items-center gap-2 rounded-lg border-brand-stroke-dark-soft text-brand-dark-fill-secondary shadow-none dark:border-brand-stroke-outermost dark:text-white"
            >
              Go to Sign in
              <ChevronsRight size={20} />
            </Button>
            <Button
              size="lg"
              className="gap-2 rounded-lg border-4 border-brand-heading bg-brand-fill-outermost shadow-sm dark:border-brand-stroke-outermost"
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
          <div className="flex h-full flex-1 flex-col overflow-hidden px-14 py-8">
            <div className="flex flex-col items-center justify-center gap-3 font-semibold leading-6">
              <div>{`${page + 1}/3`}</div>
              <div className="flex justify-center gap-3">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      'size-2 rounded-full bg-brand-fill-dark-soft transition-all duration-300',
                      {
                        'bg-brand-dark-fill-secondary': page === index,
                      },
                    )}
                    onClick={() => handleGoToPage(index)}
                  />
                ))}
              </div>
              <div className="mb-6">{steps[imageIndex].label}</div>
            </div>
            <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden text-center">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={page}
                  src={steps[imageIndex].src.src}
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
