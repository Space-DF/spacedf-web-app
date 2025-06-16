'use client'
import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Button } from '../ui/button'
import { useMounted } from '@/hooks'

type ThemeToggleProps = {
  isCollapsed: boolean
}

const ThemeToggle = ({ isCollapsed }: ThemeToggleProps) => {
  if (!isCollapsed) return <ExpandedToggle />

  return <CollapsedToggle />
}

const ExpandedToggle = () => {
  const t = useTranslations('common')
  const { theme: currentTheme, setTheme, themes, systemTheme } = useTheme()
  const { mounted } = useMounted()

  const themesWithOutSystem = themes.filter((theme) => theme !== 'system')

  if (!mounted) return null

  return (
    <div className="flex w-full rounded-lg bg-brand-fill-dark-soft p-1 dark:bg-brand-heading">
      {themesWithOutSystem.map((theme) => {
        const isActive =
          theme === (currentTheme === 'system' ? systemTheme : currentTheme)

        return (
          <div
            key={theme}
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('themeUpdated', {
                  detail: {
                    theme,
                  },
                })
              )

              setTheme(theme)
            }}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[6px] p-1 capitalize duration-300',
              isActive
                ? 'bg-white text-brand-text-dark dark:bg-brand-fill-outermost dark:text-white'
                : 'bg-transparent text-brand-text-gray dark:text-brand-dark-text-gray'
            )}
          >
            {theme === 'light' ? (
              <Sun
                size={16}
                className={cn(
                  'duration-300',
                  isActive
                    ? 'fill-brand-text-dark dark:fill-white'
                    : 'bg-transparent'
                )}
              />
            ) : (
              <Moon
                size={16}
                className={cn(
                  'duration-300',
                  isActive
                    ? 'fill-brand-text-dark dark:fill-white'
                    : 'bg-transparent'
                )}
              />
            )}
            <p className="text-xs">{t(`${theme}` as any)}</p>
          </div>
        )
      })}
    </div>
  )
}

const CollapsedToggle = () => {
  const { theme: currentTheme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="border-0 bg-transparent p-0 shadow-none"
      onClick={() => {
        setTheme((currentTheme === 'light' && 'dark') || 'light')
      }}
    >
      {currentTheme === 'light' ? (
        <Sun size={16} className="fill-black duration-300 dark:fill-white" />
      ) : (
        <Moon size={16} className="fill-black duration-300 dark:fill-white" />
      )}
    </Button>
  )
}

export default ThemeToggle
