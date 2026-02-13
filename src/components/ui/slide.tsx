'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface SlideProps {
  /**
   * If `true`, the component will transition in.
   */
  open?: boolean
  /**
   * Callback fired when the component requests to be closed.
   */
  onClose?: () => void
  /**
   * Direction the child element will enter from.
   * @default 'right'
   */
  direction?: 'up' | 'down' | 'left' | 'right'
  /**
   * The duration of the transition, in milliseconds.
   * @default 300
   */
  timeout?: number
  /**
   * Custom width for left/right slides or height for up/down slides.
   */
  size?: string
  /**
   * The content to display inside the slide.
   */
  children?: React.ReactNode
  /**
   * Additional class name for the slide container.
   */
  className?: string
  /**
   * If `true`, shows a close button.
   * @default true
   */
  showCloseButton?: boolean

  contentClassName?: string
}

export const Slide = React.forwardRef<HTMLDivElement, SlideProps>(
  (
    {
      children,
      className,
      open = false,
      onClose,
      direction = 'right',
      timeout = 300,
      size,
      showCloseButton = true,
      contentClassName,
      ...props
    },
    ref
  ) => {
    const getSlideStyles = () => {
      const defaultSize =
        direction === 'left' || direction === 'right' ? '300px' : '200px'
      const slideSize = size || defaultSize

      switch (direction) {
        case 'up':
          return {
            initial: { y: '100%' },
            animate: { y: 0 },
            exit: { y: '100%' },
            className: 'absolute bottom-0 left-0 right-0',
            style: {
              height: slideSize,
            },
          }
        case 'down':
          return {
            initial: { y: '-100%' },
            animate: { y: 0 },
            exit: { y: '-100%' },
            className: 'absolute top-0 left-0 right-0',
            style: {
              height: slideSize,
            },
          }
        case 'left':
          return {
            initial: { x: '100%' },
            animate: { x: 0 },
            exit: { x: '100%' },
            className: 'absolute top-0 right-0 bottom-0',
            style: {
              width: slideSize,
            },
          }
        case 'right':
        default:
          return {
            initial: { x: '-100%' },
            animate: { x: 0 },
            exit: { x: '-100%' },
            className: 'absolute top-0 left-0 bottom-0',
            style: {
              width: slideSize,
            },
          }
      }
    }

    const slideConfig = getSlideStyles()

    return (
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            ref={ref}
            className={cn(
              'z-20 absolute bg-background shadow-lg border overflow-hidden left-0 top-0',
              slideConfig.className,
              className
            )}
            style={slideConfig.style}
            initial={slideConfig.initial}
            animate={slideConfig.animate}
            exit={slideConfig.exit}
            transition={{
              duration: timeout / 1000,
              ease: [0.4, 0, 0.2, 1],
            }}
            {...props}
          >
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Content */}
            <div className={cn('h-full overflow-auto p-4', contentClassName)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

Slide.displayName = 'Slide'
