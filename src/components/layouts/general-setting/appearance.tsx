import { PreferencesModeDark, PreferencesModeLight } from '@/components/icons'
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { ReactNode } from 'react'

type ThemeOptionProps = {
  value: string
  label: string
  isSelected: boolean
  children: ReactNode
}

const ThemeOption = ({
  value,
  label,
  isSelected,
  children,
}: ThemeOptionProps) => (
  <RadioGroupPrimitive.Item
    value={value}
    className={cn(
      'flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 p-2 ring-offset-background duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      isSelected
        ? 'border-primary bg-brand-component-fill-light'
        : 'border-transparent bg-brand-component-fill-dark-soft hover:border-primary/30'
    )}
  >
    {children}
    <span className="text-xs font-semibold text-brand-component-text-dark">
      {label}
    </span>
  </RadioGroupPrimitive.Item>
)

const Appearance = () => {
  const { themes, theme, systemTheme, setTheme } = useTheme()
  const themesWithOutSystem = themes.filter((theme) => theme !== 'system')

  const currentTheme = themesWithOutSystem?.includes(theme as string)
    ? theme
    : systemTheme
  const isLightMode = currentTheme === 'light'

  const t = useTranslations('generalSettings')

  return (
    <div className="animate-opacity-display-effect space-y-[6px]">
      <Label className="font-semibold text-brand-component-text-dark">
        {t('preference_mode')}
      </Label>
      <RadioGroup
        className="flex gap-4"
        value={currentTheme}
        onValueChange={setTheme}
      >
        <ThemeOption
          value="light"
          label={t('light_mode')}
          isSelected={isLightMode}
        >
          <div className="flex h-[87px] w-full items-center justify-center rounded-sm bg-brand-fill-surface p-1.5">
            <PreferencesModeLight className="size-full fill-[#EDEDED]" />
          </div>
        </ThemeOption>
        <ThemeOption
          value="dark"
          label={t('dark_mode')}
          isSelected={!isLightMode}
        >
          <div className="flex h-[87px] w-full items-center justify-center overflow-hidden rounded-lg bg-[#666666] p-1.5">
            <PreferencesModeDark className="size-full fill-[#B3B3B3]" />
          </div>
        </ThemeOption>
      </RadioGroup>
    </div>
  )
}

export default Appearance
